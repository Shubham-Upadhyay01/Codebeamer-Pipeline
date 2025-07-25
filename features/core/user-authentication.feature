@URS_112233
@CMT_AUTH_001
@core @security @critical @regression
Feature: User Authentication and Authorization

  As a healthcare professional, I want to securely access the medical device system
  so that I can perform my clinical duties while maintaining patient data security

  Background:
    Given the medical device system is operational
    And the authentication service is available
    And user accounts are properly configured

  @login @smoke @security
  Scenario: Successful User Login
    Given the user has valid credentials
    And the user account is active
    When the user enters their username and password
    And clicks the login button
    Then the user should be successfully authenticated
    And the user should be redirected to the main dashboard
    And the user session should be established
    And the login event should be logged for audit purposes

  @login @security @negative
  Scenario: Failed Login with Invalid Credentials
    Given the user has invalid credentials
    When the user enters incorrect username or password
    And clicks the login button
    Then the login should be rejected
    And an appropriate error message should be displayed
    And the failed login attempt should be logged
    And the user should remain on the login screen

  @security @compliance
  Scenario: Account Lockout After Multiple Failed Attempts
    Given the user has exceeded the maximum number of login attempts
    When the user tries to login again
    Then the account should be temporarily locked
    And a lockout message should be displayed
    And the security administrator should be notified
    And the lockout event should be logged

  @session @security
  Scenario: Session Timeout
    Given the user is logged into the system
    And the user has been inactive for the configured timeout period
    When the session timeout occurs
    Then the user should be automatically logged out
    And any unsaved work should be handled appropriately
    And the user should be redirected to the login screen
    And the session termination should be logged

  @authorization @rbac
  Scenario: Role-Based Access Control
    Given the user is successfully authenticated
    And the user has specific role permissions
    When the user attempts to access system features
    Then access should be granted only to authorized features
    And unauthorized features should be hidden or disabled
    And access attempts should be logged for audit purposes

  @password @security
  Scenario: Password Complexity Requirements
    Given the user needs to change their password
    When the user enters a new password
    Then the password should meet complexity requirements
    And weak passwords should be rejected
    And appropriate feedback should be provided
    And password changes should be logged