Feature: Daily consolidated email notifications
  As a professor
  I want each student to receive at most one email per day summarizing every assessment change
  So that students stay informed without being flooded with messages

  Background:
    Given no students are registered
    And no goals are registered
    And no classes are registered
    And the following students are registered:
      | name  | cpf         | email             |
      | Alice | 12345678909 | alice@example.com |
      | Bob   | 98765432100 | bob@example.com   |
    And the following goals are registered:
      | name         |
      | Requirements |
      | Testing      |

  Rule: Every assessment change schedules a pending email for the affected student

    Scenario: A single assessment change creates one pending email
      When the professor sets the assessment of "Alice" for "Requirements" to "MA"
      Then the pending email queue contains 1 entry
      And "Alice" has 1 pending email
      And "Bob" has no pending email

    Scenario: Multiple changes for the same student are consolidated into one pending email
      When the professor sets the assessment of "Alice" for "Requirements" to "MANA"
      And the professor sets the assessment of "Alice" for "Testing" to "MPA"
      Then "Alice" has 1 pending email
      And the pending email to "Alice" summarizes 2 changes

    Scenario: Each student gets their own pending email
      When the professor sets the assessment of "Alice" for "Requirements" to "MA"
      And the professor sets the assessment of "Bob" for "Testing" to "MANA"
      Then "Alice" has 1 pending email
      And "Bob" has 1 pending email

    Scenario: Class-scoped and global assessments consolidate into the same pending email
      Given the following classes are registered:
        | topic                       | year | semester |
        | Introduction to Programming | 2026 | 1        |
      And "Alice" has been enrolled in "Introduction to Programming"
      When the professor sets the assessment of "Alice" for "Requirements" to "MA"
      And the professor sets the class assessment of "Alice" in "Introduction to Programming" for "Testing" to "MPA"
      Then "Alice" has 1 pending email
      And the pending email to "Alice" summarizes 2 changes
      And the pending email to "Alice" mentions the class "Introduction to Programming"

    Scenario: Clearing an assessment does not schedule a new email
      When the professor clears the assessment of "Alice" for "Requirements"
      Then "Alice" has no pending email

    Scenario: Updating an existing assessment still aggregates into the same pending email
      Given the assessment of "Alice" for "Requirements" is set to "MANA"
      When the professor sets the assessment of "Alice" for "Requirements" to "MA"
      Then "Alice" has 1 pending email
      And the pending email to "Alice" summarizes 2 changes

  Rule: Dispatching sends at most one email per student per day

    Scenario: Dispatching delivers every pending email and marks it as sent
      Given the assessment of "Alice" for "Requirements" is set to "MA"
      And the assessment of "Alice" for "Testing" is set to "MPA"
      When the professor dispatches the daily assessment emails
      Then the request succeeds with status 200
      And "Alice" has received 1 email
      And the sent email to "Alice" lists "Requirements" as "MA"
      And the sent email to "Alice" lists "Testing" as "MPA"
      And "Alice" has no pending email

    Scenario: Dispatching again without new changes delivers no additional email
      Given the assessment of "Alice" for "Requirements" is set to "MA"
      And the professor dispatches the daily assessment emails
      When the professor dispatches the daily assessment emails
      Then the request succeeds with status 200
      And "Alice" has received 1 email

    Scenario: Dispatching with nothing pending sends no email
      When the professor dispatches the daily assessment emails
      Then the request succeeds with status 200
      And "Alice" has received 0 emails
      And "Bob" has received 0 emails

    Scenario: New changes after a dispatch do not trigger a second email on the same day
      Given the assessment of "Alice" for "Requirements" is set to "MA"
      And the professor dispatches the daily assessment emails
      When the professor sets the assessment of "Alice" for "Testing" to "MPA"
      And the professor dispatches the daily assessment emails
      Then the request succeeds with status 200
      And "Alice" has received 1 email

    Scenario: Reject a dispatch with a malformed date
      When the professor dispatches the daily assessment emails for date "not-a-date"
      Then the request fails with status 400
      And the error reports a problem with the field "date"
