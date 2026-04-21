# RentFit – Smart Clothing Rental & Donation Platform

## Project Description

RentFit is a full-stack web application that enables users to rent premium clothing and donate unused items through a digital marketplace. It connects local boutique owners with customers while promoting a sustainable fashion ecosystem.

## Project Objective

The main objective of RentFit is to reduce the environmental impact of fast fashion while making high-quality clothing accessible and affordable. It also helps local businesses digitize and manage their inventory efficiently.

## Key Features

### Role-Based System

* Separate dashboards for Customers, Stores, and Admins
* Secure JWT-based authentication

### Store Discovery

* Interactive map with geolocation
* Filters such as Open Now, Top Rated, and Verified

### Rental Lifecycle Management

* Workflow: Pending → Approved → Rented → Return Pending → Completed
* Automatic stock updates

### Secure Payments

* Integration with eSewa payment gateway

### Communication

* Chat system between customers and stores

### Trust and Verification

* Store KYC document verification
* Admin approval required for listings

### Catalog Moderation

* Admin ensures quality of clothing items

### Donation System

* Users can donate clothes
* Stores reuse donated items in rental inventory

### Feedback System

* Reviews allowed only after completed rentals

### Privacy Controls

* Profile visibility settings
* Location sharing control

## Technologies Used

### Frontend

* React.js
* Tailwind CSS
* React Router DOM
* Axios

### Backend

* Django
* Django REST Framework (DRF)
* JWT Authentication

### Database

* SQLite (Development)
* PostgreSQL (Production)

### APIs

* eSewa Payment API
* Leaflet or Mapbox API
* SMTP or SendGrid for emails

### Deployment

* Frontend: Netlify
* Backend: Render

## System Workflow

1. User Registration and Verification
   Users register using email OTP. Store owners upload KYC documents for admin approval.

2. Inventory Management
   Stores upload clothing items. Admin reviews and approves listings.

3. Product Discovery
   Users search or explore stores using the map and filters.

4. Rental Process
   Users request items. Stores approve requests. Payment is completed through eSewa.

5. Return and Completion
   Users return items. Stores confirm return. System updates stock and enables reviews.

## Installation and Setup

### Backend (Django)

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

### Frontend (React)

```bash
cd rentfit
npm install
npm run dev
```

## Live Project

Frontend: https://rentfit.netlify.app/
Backend API: https://rentfit-vgrx.onrender.com

Note: The backend may take a few seconds to respond initially due to cold start on Render.

## Project Structure

```bash
RentFit/
│
├── backend/
│   ├── accounts/
│   ├── rent/
│   ├── donations/
│   ├── notifications/
│
├── rentfit/
│   ├── src/
│   │   ├── Pages/
│   │   ├── Components/
│   │   ├── services/
│
├── render.yaml
└── README.md
```

## Screenshots

### Login and Registration

<img width="600" src="https://github.com/user-attachments/assets/1dc7c9e6-128a-4b63-8ccb-255abca28a50" />
<img width="600" src="https://github.com/user-attachments/assets/913b1103-c533-4ce1-ab9d-564f86de5e21" />

### Customer Dashboard

<img width="600" src="https://github.com/user-attachments/assets/e93aaaa9-42ea-4df1-8415-8f6fea3494ce" />

### Store Dashboard

<img width="600" src="https://github.com/user-attachments/assets/7c237731-aa74-4b69-aadb-783907d2f14e" />

### Explore Clothes Page

<img width="600" src="https://github.com/user-attachments/assets/4524f297-11d4-40b3-9054-633474f5a0d9" />

### Map View

<img width="600" src="https://github.com/user-attachments/assets/8bed252f-526b-44b6-b480-510929b1de48" />

### Rentals Management

<img width="600" src="https://github.com/user-attachments/assets/9dec0efe-ec1b-4d73-9f84-b8982c744149" />

### Donations Panel

<img width="600" src="https://github.com/user-attachments/assets/2e820ac8-e144-4b36-9f50-1286238b4fe7" />

### Privacy Settings

<img width="600" src="https://github.com/user-attachments/assets/5ab57d15-f5fb-4c6d-9114-22baee6c6f5d" />

## Future Improvements

* AI-based recommendations
* Wallet system and split payments
* Delivery integration

## Author

Anshu Karki
BSc Computing

## License

This project is developed for educational purposes as part of a Final Year Project.
