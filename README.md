# Galactic Spacefarer 🚀

A full-stack SAP Cloud Application Programming Model (CAP) application with an SAP Fiori Elements UI for managing spacefarers.

## Features

- Fiori Elements List Report and Object Page
- Create, edit, delete and view spacefarers
- Filtering and sorting in the List Report
- Deterministic numbered pagination
- Current signed-in user information
- Planet-based data isolation
- Draft support
- Validation of email, carrying capacity and wormhole navigation skill
- Automatic stardust calculation
- Automatic confirmation email after creating a spacefarer
- Backend and UI test suites

## Business Logic

### Planet-based access

Users can only access spacefarers belonging to their own origin planet.

Two local users are available:

| User | Password | Origin planet |
|---|---|---|
| Han Solo | `han` | Corellia |
| Ellen Ripley | `ellen` | Earth |

### Spacefarer validation

When creating or updating a spacefarer:

- The origin planet must match the signed-in user's planet.
- Email addresses must be valid.
- Carrying capacity must be an integer between 1 and 10.
- Wormhole navigation skill must be an integer between 1 and 5.

The origin planet cannot be changed after creation.

### Stardust collection

Stardust collection is calculated from the wormhole navigation skill:

| Skill | Stardust multiplier |
|---:|---:|
| 1 | 0.5 |
| 2 | 1.0 |
| 3 | 1.5 |
| 4 | 2.0 |
| 5 | 2.5 |

### Confirmation email

After a spacefarer is created, a confirmation email is sent through the local SMTP server.

- Host: `localhost`
- Port: `1025`

## Application

The application provides:

### List Report

- Displays spacefarers available to the signed-in user.
- Supports filtering and sorting.
- Uses numbered pagination.
- The default page size is 15 records.
- Displays information about the currently signed-in user.

### Object Page

- Displays the details of a spacefarer.
- Allows editable fields to be changed.
- The origin planet is read-only.
- Draft handling is enabled.

## Data Model

The main entities are:

- `Spacefarers`
- `Planets`
- `Departments`
- `Positions`

A spacefarer contains, among other fields:

- Name
- Email
- Origin planet
- Department
- Position
- Carrying capacity
- Stardust collection
- Wormhole navigation skill
- Spacesuit color

## Technology Stack

- SAP CAP / Node.js
- JavaScript
- SAP Fiori Elements
- OData V4
- SQLite for local development and testing
- Nodemailer
- Mocha / Chai
- CAP test framework
- Puppeteer / OPA5 for UI tests

## Project Structure

```text
app/
  spacefarers/       Fiori Elements application

db/
  schema.cds         Data model

srv/
  spacefarer-service.cds
  spacefarer-service.js

scripts/
  Project setup scripts

test/
  backend/            Backend tests
  ui/                 UI tests
```

## Installation

Requirements:

- Node.js
- npm

Install the project dependencies:

```bash
npm install
```

## Running the Application

Start the CAP server:

```bash
npm start
```

The Fiori Elements application is available at:

```text
http://localhost:4004/galactic.spacefarer.spacefarers.spacefarers/index.html
```

## Testing

Run the complete test suite:

```bash
npm test
```

Run backend tests only:

```bash
npm run test:backend
```

Run UI tests only:

```bash
npm run test:ui
```

## OData API

The CAP service is available at:

```text
/odata/v4/spacefarer/
```

Main entity sets:

```text
/odata/v4/spacefarer/Spacefarers
/odata/v4/spacefarer/Planets
/odata/v4/spacefarer/Departments
/odata/v4/spacefarer/Positions
```

The service metadata is available at:

```text
/odata/v4/spacefarer/$metadata
```

## Local Data

The local database is populated with seed data for the available planets and related entities.

The application uses SQLite for local development and testing.
