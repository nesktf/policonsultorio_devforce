## DevForce Polyclinic
![logo](./img/logo-devforce.png)

Integral system for running and managing a polyclinic. Built using the 
[Next.js](https://nextjs.org) web framework.

([Ver README en español](./README.md))

## Features
- Administration of patient personal data and medical records.
- Administration of Professional and medical welfare services data.
- Patient appointment assignation system.
- Generation of reports with useful information for making decisions.
- Role system that separates the functionality for:
    - Management
    - Receptionists
    - Professionals

## Screenshots
### Dashboard
![Dashboard](./img/dashboard.png)

### Patients page
![Patients](./img/patients.png)

### Medical records page
![Histories](./img/histories.png)

### Reports page
![Reports](./img/reports.png)

## Dependencies
- npm
    - Typescript
    - Next.js
    - PostCSS
    - Prisma
    - Lucide-React
    - JsPDF
- Docker
    - For a PostgreSQL database
    - If you are using Windows, you will need the WSL version.

## Instalation
Clone the repository and install the npm dependencies
```sh
$ git clone https://github.com/nesktf/policonsultorio_devforce.git
$ cd policonsultorio_devforce/
$ npm install
```

Initialize the Postgres docker container
```sh
$ docker pull postgres:15
$ docker compose up -d
```

Initialize the prisma schema
```sh
$ npx prisma migrate dev
$ npx prisma generate
```

Optionally, fill the database with dummy data
```sh
$ ./script/psql_exec.sh script/test_rows.sql
```

Finnaly, run the server
```sh
$ npm run dev
```

By default, the webpage is hosted at [http://localhost:3000](http://localhost:3000)
