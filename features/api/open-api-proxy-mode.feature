@URS_658
@CMT_DOC0726582_10.100.10_C08
@api @critical @regression
Feature: Open API Proxy Mode - Interface support for accessing 3rd party clinical studies

  As a radiologist, I want to be able to pull the next exam from the queue,
  so that I can report efficiently

  Background:
    Given the system is configured for API proxy mode
    And third-party clinical study interfaces are available
    And the radiologist is authenticated and authorized

  @manual @queue-management
  Scenario: Next Procedure when Manual Queue was Built and No Remaining Non-Paused Procedures
    Given the radiologist has manually built a work queue
    And the radiologist has a procedure open in reporting
    And there are no remaining non-paused procedures in the work queue
    When the radiologist chooses to move to the next procedure
    Then the worklist is displayed
    And the system shows available procedures from connected clinical studies
    And the radiologist can select a new procedure to continue workflow

  @MANUAL_17429
  @automated @queue-management
  Scenario: Next Procedure when Manual Queue was Built and Remaining Non-Paused Procedures
    Given the radiologist has non-paused procedures in the work queue
    And the radiologist has a procedure open in reporting
    When the radiologist chooses to move to the next procedure
    Then the next procedure in the work queue is opened in reporting
    And the current procedure is marked as completed or paused appropriately
    And the procedure counter is updated to reflect the new position

  @api @integration
  Scenario: API Proxy Connection Failure
    Given the radiologist is working with a procedure
    And the API proxy connection to third-party systems is lost
    When the radiologist attempts to move to the next procedure
    Then the system displays an appropriate error message
    And the radiologist is provided with alternative workflow options
    And the system attempts to reconnect automatically

  @performance @api
  Scenario: API Response Time Validation
    Given the API proxy is configured for third-party access
    When a request is made to retrieve procedure data
    Then the response time should be less than 3 seconds
    And the data integrity should be maintained
    And appropriate logging should be recorded for audit purposes

  @security @compliance
  Scenario: Secure Third-Party Data Access
    Given the radiologist requests access to third-party clinical studies
    When the API proxy processes the request
    Then all communication must be encrypted
    And user authorization must be validated
    And audit logs must be generated for compliance tracking