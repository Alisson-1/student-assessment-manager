Feature: Assessment management
  As a professor
  I want to record MANA, MPA, and MA for each student across learning goals
  So that I can track every learner's progress in a single view

  Background:
    Given no students are registered
    And no goals are registered

  Rule: Goals are managed as CRUD resources

    Scenario: Register a new goal
      When the professor registers a goal named "Requirements"
      Then the request succeeds with status 201
      And the goal catalog contains "Requirements"

    Scenario: List registered goals
      Given the following goals are registered:
        | name         |
        | Requirements |
        | Testing      |
      When the professor requests the list of goals
      Then the request succeeds with status 200
      And the list of goals contains 2 entries

    Scenario: Rename an existing goal
      Given the following goals are registered:
        | name     |
        | Coverage |
      When the professor renames the goal "Coverage" to "Testing"
      Then the request succeeds with status 200
      And the goal catalog contains "Testing"
      And the goal catalog does not contain "Coverage"

    Scenario: Delete a goal
      Given the following goals are registered:
        | name         |
        | Requirements |
      When the professor deletes the goal "Requirements"
      Then the request succeeds with status 204
      And the goal catalog does not contain "Requirements"

    Scenario: Reject a goal with a missing name
      When the professor registers a goal named ""
      Then the request fails with status 400
      And the error reports a problem with the field "name"

    Scenario: Reject a duplicated goal name
      Given the following goals are registered:
        | name         |
        | Requirements |
      When the professor registers a goal named "Requirements"
      Then the request fails with status 409

  Rule: Assessments map (student, goal) to MANA, MPA, or MA

    Background:
      Given the following students are registered:
        | name  | cpf         | email             |
        | Alice | 12345678909 | alice@example.com |
        | Bob   | 98765432100 | bob@example.com   |
      And the following goals are registered:
        | name         |
        | Requirements |
        | Testing      |

    Scenario: Record a new assessment
      When the professor sets the assessment of "Alice" for "Requirements" to "MA"
      Then the request succeeds with status 200
      And the assessment of "Alice" for "Requirements" is "MA"

    Scenario: Update an existing assessment
      Given the assessment of "Alice" for "Requirements" is set to "MANA"
      When the professor sets the assessment of "Alice" for "Requirements" to "MA"
      Then the request succeeds with status 200
      And the assessment of "Alice" for "Requirements" is "MA"

    Scenario: List all assessments
      Given the assessment of "Alice" for "Requirements" is set to "MA"
      And the assessment of "Bob" for "Testing" is set to "MPA"
      When the professor requests the list of assessments
      Then the request succeeds with status 200
      And the list of assessments contains 2 entries

    Scenario: Clear an assessment
      Given the assessment of "Alice" for "Requirements" is set to "MPA"
      When the professor clears the assessment of "Alice" for "Requirements"
      Then the request succeeds with status 204
      And there is no assessment for "Alice" on "Requirements"

    Scenario: Reject an unknown assessment value
      When the professor sets the assessment of "Alice" for "Requirements" to "XYZ"
      Then the request fails with status 400
      And the error reports a problem with the field "value"

    Scenario: Reject assessment for an unknown student
      When the professor sets an assessment for an unknown student on "Requirements" to "MA"
      Then the request fails with status 404

    Scenario: Reject assessment for an unknown goal
      When the professor sets an assessment for "Alice" on an unknown goal to "MA"
      Then the request fails with status 404

    Scenario: Clearing a missing assessment fails with 404
      When the professor clears the assessment of "Alice" for "Testing"
      Then the request fails with status 404

    Scenario: Deleting a goal cascades to its assessments
      Given the assessment of "Alice" for "Requirements" is set to "MA"
      And the assessment of "Bob" for "Requirements" is set to "MPA"
      And the assessment of "Alice" for "Testing" is set to "MANA"
      When the professor deletes the goal "Requirements"
      Then the request succeeds with status 204
      And the list of assessments contains 1 entry
      And the assessment of "Alice" for "Testing" is "MANA"

    Scenario: Deleting a student cascades to its assessments
      Given the assessment of "Alice" for "Requirements" is set to "MA"
      And the assessment of "Bob" for "Requirements" is set to "MPA"
      When the professor deletes the student "Alice"
      Then the request succeeds with status 204
      And the list of assessments contains 1 entry
      And there is no assessment for "Alice" on "Requirements"
