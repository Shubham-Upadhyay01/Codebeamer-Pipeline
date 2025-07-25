@URS_234566
@NFR @compliance @ui @critical
Feature: CE Marking - the system shall display CE marking

  As a system user I shall be able to find evidence of a CE mark in use manual for the system
  or on its CD label so I am sure it complies to my country standard

  Background:
    Given the medical device system is installed and operational
    And the system complies with European Conformity standards
    And appropriate CE marking documentation is available

  @MANUAL_29476
  @ui @compliance
  Scenario: The system shall display the version number
    Given the product version number is X
    When the user accesses the system information
    Then the product labeling shall display the version number
    And the version number format shall be clearly readable
    And the version information shall be accessible from the main interface

  @visual @compliance @smoke
  Scenario: CE Mark Visibility on Product Label
    Given the medical device has a physical product label
    When the user examines the product labeling
    Then the CE marking shall be clearly visible
    And the CE marking shall conform to the required size specifications
    And the CE marking shall be permanently affixed to the device
    And the notified body number shall be displayed if applicable

  @documentation @compliance
  Scenario: CE Mark Evidence in User Manual
    Given the system user manual is provided
    When the user reviews the manual for compliance information
    Then the CE marking information shall be documented
    And the declaration of conformity shall be referenced
    And the intended use and contraindications shall be clearly stated
    And the safety warnings and precautions shall be included

  @ui @information-display
  Scenario: System Information Display
    Given the user has appropriate access permissions
    When the user navigates to the system information screen
    Then the CE marking status shall be displayed
    And the conformity information shall be accessible
    And the regulatory compliance details shall be shown
    And the information shall be presented in a clear, professional format

  @regulatory @compliance
  Scenario: Multi-Language CE Marking Support
    Given the system is deployed in different European countries
    When the user selects their preferred language
    Then the CE marking information shall be available in the selected language
    And the essential safety information shall be translated appropriately
    And the regulatory compliance text shall maintain its legal accuracy

  @audit @compliance
  Scenario: CE Marking Audit Trail
    Given an auditor is reviewing system compliance
    When the auditor requests CE marking documentation
    Then the system shall provide access to all required documentation
    And the audit trail shall show proper CE marking implementation
    And the documentation version control shall be maintained
    And the compliance history shall be readily available