# OPPR Frontend Features - Design Document

**Purpose:** Committee reference document for current project status

**Last Updated:** January 2026

---

## Overview

OPPR (Open Pinball Player Ranking System) has three web interfaces:

| Application | Purpose |
|-------------|---------|
| **Main Website** | Full-featured site for players, tournament organizers, and administrators |
| **Demo Site** | Interactive educational tool explaining how rankings work |
| **Minimal Site** | Simple, lightweight view of rankings and tournaments |

---

## Main Website Features

### For Everyone (No Login Required)

#### Home Page
- View the **Top 10 ranked players** at a glance
- See **recent tournaments** with their classification level
- Read the **latest blog posts** and news

#### Player Rankings
- Browse the **complete player leaderboard** sorted by world ranking
- **Search** for specific players by name
- View each player's rank, rating, and number of events played

#### Player Profiles
Each player has a dedicated page showing:
- **Current rating** and world ranking
- **Total points** earned
- **Performance stats**: first place wins, top 3 finishes, best finish, average efficiency
- **Full tournament history** with:
  - Event name, date, and location
  - Finishing position (with medals for top 3)
  - Points earned and current point value after time decay

#### Tournaments
- Browse all tournaments in the system
- **Search** by tournament name
- View tournament details including:
  - Location and date
  - Event classification (Certified, Certified+, Championship Series, Major)
  - Point values for finishing positions

#### Blog & News
- Read articles and announcements
- Browse posts by **topic tags**
- View publication dates and authors

#### Information Pages
- Privacy Policy
- Terms of Service
- Code of Conduct

---

### For Registered Users (Login Required)

#### Personal Dashboard
After signing in, users see their personalized dashboard with:
- **Your stats** (if linked to a player profile)
- **Your position** on the leaderboard
- **Your recent tournament results**
- **Recent activity** in the system

#### Account Features
- Create an account with email and password
- Sign in and sign out
- Link your account to your player profile

---

### For Administrators

Administrators have access to a management panel with these capabilities:

#### Tournament Management
- **Create** new tournaments
- **Import** tournaments from Matchplay (external system)
- **Edit** tournament details:
  - Name, date, location
  - Tournament quality settings
  - Event classification
- **Manage results**:
  - Add player results (position finished)
  - Edit or remove results
  - Mark players as opted-out
  - View calculated point values

#### Player Management
- **Create** new player profiles
- **Edit** player information
- **Link** players to user accounts
- View player ratings and statistics

#### User Management
- View all registered users
- **Assign roles** (User or Administrator)
- **Link** user accounts to player profiles
- Remove user accounts

#### Location Management
- **Create** and **edit** venue locations
- Store city, state, and country information

#### Blog Management
- **Create** new blog posts with rich text formatting
- Add images and links
- **Save as draft** or **publish** immediately
- **Schedule** posts for future publication
- **Manage tags** for organizing content

---

## Demo Site Features

The demo site is an **educational tool** that explains how the OPPR ranking system works:

#### Tournament Calculator
- Interactive demonstration of how tournament points are calculated
- Adjust settings to see how they affect point values
- Enter sample players and results to see point distribution

#### System Explanation
- How **base values** are calculated
- How **player ratings** affect tournament value
- How **tournament quality** impacts points
- How **event classifications** (Major, Championship, etc.) work
- How **time decay** reduces point values over time

#### Format Comparison
- Visual comparison of different tournament formats
- See how points are distributed across finishing positions

---

## Minimal Site Features

A simple, fast-loading interface with basic functionality:

- **Player Rankings** - View top-rated players
- **Tournaments** - Browse tournament listings
- Simple navigation between views

---

## Feature Summary

| Feature Area | What Users Can Do |
|--------------|-------------------|
| **Player Rankings** | View, search, and explore player standings |
| **Player Profiles** | See detailed stats and tournament history |
| **Tournaments** | Browse events, view results and point values |
| **Blog** | Read news and articles, filter by topic |
| **User Accounts** | Register, sign in, view personal dashboard |
| **Admin: Tournaments** | Create, import, edit, manage results |
| **Admin: Players** | Create, edit, link to accounts |
| **Admin: Users** | Manage accounts and permissions |
| **Admin: Blog** | Write, edit, publish articles |
| **Demo** | Learn how the ranking system works |

---

## User Roles

| Role | Access Level |
|------|--------------|
| **Visitor** | View all public pages (rankings, profiles, tournaments, blog) |
| **Registered User** | All visitor access + personal dashboard |
| **Administrator** | All access + management panel for tournaments, players, users, and blog |
