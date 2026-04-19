Feature: Student management
  As a professor
  I want to manage my students
  So that my roster stays accurate and up to date

  Background:
    Given no students are registered

  Scenario: Register a new student
    When the professor registers a student with:
      | name  | cpf            | email             |
      | Alice | 123.456.789-09 | alice@example.com |
    Then the request succeeds with status 201
    And the roster contains the student "Alice" with email "alice@example.com"

  Scenario: List all registered students
    Given the following students are registered:
      | name  | cpf         | email             |
      | Alice | 12345678909 | alice@example.com |
      | Bob   | 98765432100 | bob@example.com   |
    When the professor requests the list of students
    Then the request succeeds with status 200
    And the list of students contains 2 entries

  Scenario: Update an existing student
    Given the following students are registered:
      | name  | cpf         | email             |
      | Alice | 12345678909 | alice@example.com |
    When the professor updates the student "Alice" with:
      | name  | cpf         | email                 |
      | Alice | 12345678909 | alice.new@example.com |
    Then the request succeeds with status 200
    And the roster contains the student "Alice" with email "alice.new@example.com"

  Scenario: Delete a student
    Given the following students are registered:
      | name  | cpf         | email             |
      | Alice | 12345678909 | alice@example.com |
    When the professor deletes the student "Alice"
    Then the request succeeds with status 204
    And the roster is empty

  Scenario: Reject registration with a missing name
    When the professor registers a student with:
      | name | cpf         | email             |
      |      | 12345678909 | alice@example.com |
    Then the request fails with status 400
    And the error reports a problem with the field "name"

  Scenario: Reject registration with an invalid CPF
    When the professor registers a student with:
      | name  | cpf | email             |
      | Alice | 123 | alice@example.com |
    Then the request fails with status 400
    And the error reports a problem with the field "cpf"

  Scenario: Reject registration with an invalid email
    When the professor registers a student with:
      | name  | cpf         | email   |
      | Alice | 12345678909 | invalid |
    Then the request fails with status 400
    And the error reports a problem with the field "email"

  Scenario: Reject a duplicated CPF
    Given the following students are registered:
      | name  | cpf         | email             |
      | Alice | 12345678909 | alice@example.com |
    When the professor registers a student with:
      | name   | cpf         | email              |
      | Alicia | 12345678909 | alicia@example.com |
    Then the request fails with status 409

  Scenario: Reject a duplicated email
    Given the following students are registered:
      | name  | cpf         | email             |
      | Alice | 12345678909 | alice@example.com |
    When the professor registers a student with:
      | name   | cpf         | email             |
      | Alicia | 98765432100 | alice@example.com |
    Then the request fails with status 409

  Scenario: Updating a non-existent student fails with 404
    When the professor updates a non-existent student
    Then the request fails with status 404

  Scenario: Deleting a non-existent student fails with 404
    When the professor deletes a non-existent student
    Then the request fails with status 404
