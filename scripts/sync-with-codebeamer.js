#!/usr/bin/env node

/**
 * Codebeamer Synchronization Script
 * 
 * This script synchronizes feature files with Codebeamer requirements
 * and updates test execution results for full traceability.
 */

const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const chalk = require('chalk');

class CodebeamerSync {
    constructor() {
        this.config = this.loadConfig();
        this.apiClient = this.setupApiClient();
    }

    loadConfig() {
        try {
            const configPath = path.join(__dirname, '../config/codebeamer/traceability-config.json');
            return fs.readJsonSync(configPath);
        } catch (error) {
            console.error(chalk.red('Error loading configuration:'), error.message);
            process.exit(1);
        }
    }

    setupApiClient() {
        const baseURL = this.config.codebeamer.server.url;
        const token = process.env[this.config.codebeamer.authentication.token_env_var];
        
        if (!token) {
            console.error(chalk.red('Codebeamer API token not found in environment variables'));
            process.exit(1);
        }

        return axios.create({
            baseURL: `${baseURL}/api/${this.config.codebeamer.server.api_version}`,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            timeout: this.config.codebeamer.server.timeout
        });
    }

    async scanFeatureFiles() {
        console.log(chalk.blue('Scanning feature files...'));
        
        const featureFiles = await this.findFeatureFiles();
        const requirements = new Map();
        
        for (const filePath of featureFiles) {
            const content = await fs.readFile(filePath, 'utf8');
            const fileRequirements = this.extractRequirements(content, filePath);
            
            fileRequirements.forEach(req => {
                if (!requirements.has(req.id)) {
                    requirements.set(req.id, {
                        ...req,
                        featureFiles: [filePath],
                        scenarios: req.scenarios
                    });
                } else {
                    const existing = requirements.get(req.id);
                    existing.featureFiles.push(filePath);
                    existing.scenarios.push(...req.scenarios);
                }
            });
        }
        
        return Array.from(requirements.values());
    }

    async findFeatureFiles() {
        const glob = require('glob');
        const patterns = this.config.feature_files.scan_directories;
        
        let files = [];
        for (const pattern of patterns) {
            const matches = glob.sync(pattern, { cwd: process.cwd() });
            files = files.concat(matches.map(f => path.resolve(f)));
        }
        
        return files;
    }

    extractRequirements(content, filePath) {
        const requirements = [];
        const lines = content.split('\n');
        let currentScenarios = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            
            // Extract requirement IDs from tags
            if (line.startsWith('@') && this.isRequirementTag(line)) {
                const reqId = line.substring(1);
                const reqType = this.getRequirementType(reqId);
                
                if (reqType) {
                    requirements.push({
                        id: reqId,
                        type: reqType,
                        filePath: filePath,
                        scenarios: []
                    });
                }
            }
            
            // Extract scenario information
            if (line.startsWith('Scenario:')) {
                const scenarioName = line.substring(9).trim();
                currentScenarios.push({
                    name: scenarioName,
                    lineNumber: i + 1
                });
            }
        }
        
        // Associate scenarios with requirements
        requirements.forEach(req => {
            req.scenarios = currentScenarios;
        });
        
        return requirements;
    }

    isRequirementTag(tag) {
        const reqTypes = Object.keys(this.config.traceability.requirement_types);
        return reqTypes.some(type => 
            tag.startsWith(`@${this.config.traceability.requirement_types[type].prefix}`)
        );
    }

    getRequirementType(reqId) {
        for (const [type, config] of Object.entries(this.config.traceability.requirement_types)) {
            if (reqId.startsWith(config.prefix)) {
                return type;
            }
        }
        return null;
    }

    async syncWithCodebeamer(requirements) {
        console.log(chalk.blue(`Syncing ${requirements.length} requirements with Codebeamer...`));
        
        for (const req of requirements) {
            try {
                await this.updateRequirementInCodebeamer(req);
                console.log(chalk.green(`✓ Synced ${req.id}`));
            } catch (error) {
                console.error(chalk.red(`✗ Failed to sync ${req.id}:`), error.message);
            }
        }
    }

    async updateRequirementInCodebeamer(requirement) {
        const trackerConfig = this.config.traceability.requirement_types[requirement.type];
        
        // Search for existing requirement
        const searchResponse = await this.apiClient.get(`/items/query`, {
            params: {
                queryString: `tracker.id IN (${trackerConfig.tracker_id}) AND name LIKE "${requirement.id}%"`
            }
        });
        
        const existingItems = searchResponse.data.items || [];
        
        if (existingItems.length > 0) {
            // Update existing requirement
            const item = existingItems[0];
            await this.updateRequirementItem(item.id, requirement);
        } else {
            // Create new requirement
            await this.createRequirementItem(trackerConfig.tracker_id, requirement);
        }
    }

    async updateRequirementItem(itemId, requirement) {
        const updateData = {
            name: requirement.id,
            description: this.generateRequirementDescription(requirement)
        };
        
        await this.apiClient.put(`/items/${itemId}`, updateData);
    }

    async createRequirementItem(trackerId, requirement) {
        const createData = {
            tracker: { id: trackerId },
            name: requirement.id,
            description: this.generateRequirementDescription(requirement)
        };
        
        await this.apiClient.post(`/items`, createData);
    }

    generateRequirementDescription(requirement) {
        let description = `Requirement traced from feature files:\n\n`;
        
        description += `**Feature Files:**\n`;
        requirement.featureFiles.forEach(file => {
            description += `- ${path.relative(process.cwd(), file)}\n`;
        });
        
        description += `\n**Test Scenarios:**\n`;
        requirement.scenarios.forEach((scenario, index) => {
            description += `${index + 1}. ${scenario.name}\n`;
        });
        
        description += `\n*Last updated: ${new Date().toISOString()}*`;
        
        return description;
    }

    async generateReport(requirements) {
        console.log(chalk.blue('Generating traceability report...'));
        
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalRequirements: requirements.length,
                byType: {}
            },
            requirements: requirements,
            coverage: this.calculateCoverage(requirements)
        };
        
        // Calculate requirements by type
        requirements.forEach(req => {
            report.summary.byType[req.type] = (report.summary.byType[req.type] || 0) + 1;
        });
        
        const outputDir = this.config.reporting.output_directory;
        await fs.ensureDir(outputDir);
        
        // Generate JSON report
        if (this.config.reporting.formats.includes('json')) {
            const jsonPath = path.join(outputDir, 'traceability-report.json');
            await fs.writeJson(jsonPath, report, { spaces: 2 });
            console.log(chalk.green(`JSON report saved to: ${jsonPath}`));
        }
        
        // Generate HTML report
        if (this.config.reporting.formats.includes('html')) {
            const htmlPath = path.join(outputDir, 'traceability-report.html');
            const htmlContent = this.generateHtmlReport(report);
            await fs.writeFile(htmlPath, htmlContent);
            console.log(chalk.green(`HTML report saved to: ${htmlPath}`));
        }
        
        return report;
    }

    calculateCoverage(requirements) {
        const totalScenarios = requirements.reduce((sum, req) => sum + req.scenarios.length, 0);
        
        return {
            totalRequirements: requirements.length,
            totalScenarios: totalScenarios,
            averageScenariosPerRequirement: totalScenarios / requirements.length || 0
        };
    }

    generateHtmlReport(report) {
        return `
<!DOCTYPE html>
<html>
<head>
    <title>Traceability Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .summary { background-color: #f8f9fa; padding: 15px; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>Requirements Traceability Report</h1>
    
    <div class="summary">
        <h2>Summary</h2>
        <p><strong>Generated:</strong> ${report.timestamp}</p>
        <p><strong>Total Requirements:</strong> ${report.summary.totalRequirements}</p>
        <p><strong>Total Test Scenarios:</strong> ${report.coverage.totalScenarios}</p>
    </div>
    
    <h2>Requirements by Type</h2>
    <table>
        <tr><th>Type</th><th>Count</th></tr>
        ${Object.entries(report.summary.byType).map(([type, count]) => 
            `<tr><td>${type}</td><td>${count}</td></tr>`
        ).join('')}
    </table>
    
    <h2>Detailed Requirements</h2>
    <table>
        <tr><th>Requirement ID</th><th>Type</th><th>Feature Files</th><th>Scenarios</th></tr>
        ${report.requirements.map(req => `
            <tr>
                <td>${req.id}</td>
                <td>${req.type}</td>
                <td>${req.featureFiles.map(f => path.basename(f)).join(', ')}</td>
                <td>${req.scenarios.length}</td>
            </tr>
        `).join('')}
    </table>
</body>
</html>`;
    }

    async run() {
        try {
            console.log(chalk.cyan('🚀 Starting Codebeamer synchronization...\n'));
            
            const requirements = await this.scanFeatureFiles();
            console.log(chalk.green(`Found ${requirements.length} requirements\n`));
            
            if (this.config.automation.sync_on_commit) {
                await this.syncWithCodebeamer(requirements);
            }
            
            if (this.config.automation.generate_reports) {
                await this.generateReport(requirements);
            }
            
            console.log(chalk.cyan('\n✅ Synchronization completed successfully!'));
            
        } catch (error) {
            console.error(chalk.red('\n❌ Synchronization failed:'), error.message);
            process.exit(1);
        }
    }
}

// Run the script if called directly
if (require.main === module) {
    const sync = new CodebeamerSync();
    sync.run();
}

module.exports = CodebeamerSync;