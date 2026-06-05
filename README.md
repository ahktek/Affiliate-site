# AI Tools Affiliate Review Platform

A modern, production-ready Product Review & Comparison website built with Next.js 14+ (App Router), Firebase, and Tailwind CSS.

## Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: Firebase Firestore (NoSQL)
- **Authentication**: Firebase Authentication
- **AI Chatbot**: Google Gemini API (`gemini-1.5-flash`)
- **Email Service**: Resend API

## Project Structure
- `app/`: Next.js App Router (Public facing pages and Admin panel)
- `components/`: UI components (shadcn/ui and custom components)
- `lib/firebase/`: Firebase Client and Admin SDK configurations
- `types/`: TypeScript definitions for the data models

## Setup Instructions

### 1. Install Dependencies
This project uses `bun` or `npm`. Run the following command in the root directory:
```bash
npm install
# or
bun install
```

### 2. Configure Firebase
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Create a new project.
3. Enable **Firestore Database** and **Authentication** (Email/Password).
4. Register a Web App in your Firebase project to get the Client configuration.
5. Go to Project Settings -> Service Accounts and generate a new private key for the Admin SDK.

### 3. Environment Variables
Copy `.env.local.example` to `.env.local`:
```bash
cp .env.local.example .env.local
```
Fill in the following variables:
- Firebase Client Config (`NEXT_PUBLIC_FIREBASE_*`)
- Firebase Admin SDK Config (`FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`)
- Gemini API Key (`GEMINI_API_KEY`)
- Resend API Key (`RESEND_API_KEY`)

> **Note:** When pasting the `FIREBASE_PRIVATE_KEY` into `.env.local`, ensure it is surrounded by quotes, e.g., `FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIB...-----END PRIVATE KEY-----\n"`

### 4. Run the Development Server
```bash
npm run dev
# or
bun run dev
```
Navigate to `http://localhost:3000` to view the website.

### 5. Access the Admin Panel
Navigate to `http://localhost:3000/admin/login`. 
To gain access:
1. Sign up a user in Firebase Authentication manually (via console or an exposed endpoint).
2. Go to your Firestore Database, create a `users` collection.
3. Add a document where the ID matches the Firebase Auth UID. Set the `role` field to `"admin"`.

## Features
- **Public Frontend**: SEO-optimized Homepage, Blog Listing, Product Reviews with Score Breakdown, Category Filtering.
- **Admin Dashboard**: Custom CMS for managing Posts, Reviews, Categories, and Newsletter Subscribers. Includes a Rich Text Editor (React-Quill).
- **AI Chatbot**: Floating widget powered by Google Gemini, maintaining session history in `localStorage`.
- **Newsletter Capture**: Integrated with Resend API for sending welcome emails.
- **SEO & Performance**: Dynamic JSON-LD structured data, XML Sitemaps, and optimized Next.js Image rendering.
