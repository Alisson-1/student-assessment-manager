Feature: Class management
  As a professor
  I want to manage my classes, enrollments, and per-class assessments
  So that I can track each course offering and its students separately

  Background:
    Given no students are registered
    And no goals are registered
    And no classes are registered

  Rule: Classes are managed as CRUD resources

    Scenario: Register a new class
      When the professor registers a class with:
        | topic                       | year | semester |
        | Introduction to Programming | 2026 |        1 |
      Then the request succeeds with status 201
      And the class catalog contains "Introduction to Programming" for 2026 semester 1

    Scenario: List registered classes
      Given the following classes are registered:
        | topic                       | year | semester |
        | Introduction to Programming | 2026 |        1 |
        | Software Testing            | 2026 |        2 |
      When the professor requests the list of classes
      Then the request succeeds with status 200
      And the list of classes contains 2 entries

    Scenario: Update an existing class
      Given the following classes are registered:
        | topic                       | year | semester |
        | Introduction to Programming | 2026 |        1 |
      When the professor updates the class "Introduction to Programming" with:
        | topic                        | year | semester |
        | Intro to Programming         | 2026 |        1 |
      Then the request succeeds with status 200
      And the class catalog contains "Intro to Programming" for 2026 semester 1

    Scenario: Delete a class
      Given the following classes are registered:
        | topic                       | year | semester |
        | Introduction to Programming | 2026 |        1 |
      When the professor deletes the class "Introduction to Programming"
      Then the request succeeds with status 204
      And the class catalog does not contain "Introduction to Programming" for 2026 semester 1

    Scenario: Reject a class with a missing topic
      When the professor registers a class with:
        | topic | year | semester |
        |       | 2026 |        1 |
      Then the request fails with status 400
      And the error reports a problem with the field "topic"

    Scenario: Reject a class with an invalid semester
      When the professor registers a class with:
        | topic                       | year | semester |
        | Introduction to Programming | 2026 |        3 |
      Then the request fails with status 400
      And the error reports a problem with the field "semester"

    Scenario: Reject a duplicated (topic, year, semester) triple
      Given the following classes are registered:
        | topic                       | year | semester |
        | Introduction to Programming | 2026 |        1 |
      When the professor registers a class with:
        | topic                       | year | semester |
        | Introduction to Programming | 2026 |        1 |
      Then the request fails with status 409

    Scenario: Updating a non-existent class fails with 404
      When the professor updates a non-existent class
      Then the request fails with status 404

    Scenario: Deleting a non-existent class fails with 404
      When the professor deletes a non-existent class
      Then the request fails with status 404

  Rule: Students can be enrolled in and unenrolled from a class

    Background:
      Given the following students are registered:
        | name  | cpf         | email             |
        | Alice | 12345678909 | alice@example.com |
        | Bob   | 98765432100 | bob@example.com   |
      And the following classes are registered:
        | topic                       | year | semester |
        | Introduction to Programming | 2026 |        1 |

    Scenario: Enroll a student in a class
      When the professor enrolls "Alice" in "Introduction to Programming"
      Then the request succeeds with status 200
      And "Alice" is enrolled in "Introduction to Programming"

    Scenario: Reject enrolling the same student twice
      Given "Alice" has been enrolled in "Introduction to Programming"
      When the professor enrolls "Alice" in "Introduction to Programming"
      Then the request fails with status 409

    Scenario: Unenroll a student
      Given "Alice" has been enrolled in "Introduction to Programming"
      When the professor unenrolls "Alice" from "Introduction to Programming"
      Then the request succeeds with status 200
      And "Alice" is not enrolled in "Introduction to Programming"

    Scenario: Unenrolling a non-enrolled student fails with 404
      When the professor unenrolls "Bob" from "Introduction to Programming"
      Then the request fails with status 404

  Rule: Class assessments map (class, student, goal) to MANA, MPA, or MA

    Background:
      Given the following students are registered:
        | name  | cpf         | email             |
        | Alice | 12345678909 | alice@example.com |
        | Bob   | 98765432100 | bob@example.com   |
      And the following goals are registered:
        | name         |
        | Requirements |
        | Testing      |
      And the following classes are registered:
        | topic                       | year | semester |
        | Introduction to Programming | 2026 |        1 |
      And "Alice" has been enrolled in "Introduction to Programming"

    Scenario: Record a new class assessment for an enrolled student
      When the professor sets the class assessment of "Alice" in "Introduction to Programming" for "Requirements" to "MA"
      Then the request succeeds with status 200
      And the class assessment of "Alice" in "Introduction to Programming" for "Requirements" is "MA"

    Scenario: Update an existing class assessment
      Given the class assessment of "Alice" in "Introduction to Programming" for "Requirements" is set to "MANA"
      When the professor sets the class assessment of "Alice" in "Introduction to Programming" for "Requirements" to "MPA"
      Then the request succeeds with status 200
      And the class assessment of "Alice" in "Introduction to Programming" for "Requirements" is "MPA"

    Scenario: List assessments for a class
      Given the class assessment of "Alice" in "Introduction to Programming" for "Requirements" is set to "MA"
      And the class assessment of "Alice" in "Introduction to Programming" for "Testing" is set to "MPA"
      When the professor requests the assessments of the class "Introduction to Programming"
      Then the request succeeds with status 200
      And the list of class assessments contains 2 entries

    Scenario: Clear a class assessment
      Given the class assessment of "Alice" in "Introduction to Programming" for "Requirements" is set to "MPA"
      When the professor clears the class assessment of "Alice" in "Introduction to Programming" for "Requirements"
      Then the request succeeds with status 204
      And there is no class assessment for "Alice" in "Introduction to Programming" on "Requirements"

    Scenario: Reject assessing a student who is not enrolled
      When the professor sets the class assessment of "Bob" in "Introduction to Programming" for "Requirements" to "MA"
      Then the request fails with status 400
      And the error reports a problem with the field "studentId"

    Scenario: Reject an unknown assessment value inside a class
      When the professor sets the class assessment of "Alice" in "Introduction to Programming" for "Requirements" to "XYZ"
      Then the request fails with status 400
      And the error reports a problem with the field "value"

    Scenario: Unenrolling a student removes their class assessments
      Given the class assessment of "Alice" in "Introduction to Programming" for "Requirements" is set to "MA"
      And the class assessment of "Alice" in "Introduction to Programming" for "Testing" is set to "MPA"
      When the professor unenrolls "Alice" from "Introduction to Programming"
      Then the request succeeds with status 200
      And the list of class assessments contains 0 entries when the professor lists assessments of "Introduction to Programming"

    Scenario: Deleting a class removes its assessments
      Given the class assessment of "Alice" in "Introduction to Programming" for "Requirements" is set to "MA"
      When the professor deletes the class "Introduction to Programming"
      Then the request succeeds with status 204

    Scenario: Deleting a student cascades to their class assessments
      Given the class assessment of "Alice" in "Introduction to Programming" for "Requirements" is set to "MA"
      When the professor deletes the student "Alice"
      Then the request succeeds with status 204
      And "Alice" is not enrolled in "Introduction to Programming"

    Scenario: Deleting a goal cascades to class assessments
      Given the class assessment of "Alice" in "Introduction to Programming" for "Requirements" is set to "MA"
      And the class assessment of "Alice" in "Introduction to Programming" for "Testing" is set to "MPA"
      When the professor deletes the goal "Requirements"
      Then the request succeeds with status 204
      And the list of class assessments contains 1 entries when the professor lists assessments of "Introduction to Programming"
      And the class assessment of "Alice" in "Introduction to Programming" for "Testing" is "MPA"
