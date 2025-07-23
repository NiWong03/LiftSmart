# Functional Requirements

> **Note:** See "Tasks" for user stories/epics

## 1. Authentication & User Management

### Login/OAuth Requirements
- **User Registration**: Register and store user data (Username, Password, Email) with Firebase
- **User Authentication**: Verify sign-in credentials when user enters username and password
- **Data Persistence**: Save user data for schedules, workout data, and activity state

## 2. Scheduling System

### Workout Management
- **Create Workout**: Add workout blocks to schedule with title, details, and descriptions
- **Delete Workout**: Remove workout blocks from schedule
- **Edit Workout**: Modify existing workout blocks, including title, details, and descriptions

### Calendar Interface
- **Multi-view Calendar**: Display user schedule in month, week, and day views

## 3. Activity Tracking

### Activity Dashboard
- **Daily Todo Display**: Show user's planned activities for the current day
- **Completion Tracking**: Display activities the user has completed for the day
- **Activity Logging**: Allow users to log and edit completed activities
- **Intensity Monitoring**: Display current activity intensity levels
- **AI Integration**: Include AI-powered suggestions and recommendations (*See AI Agent Section*)

# Non-Functional Requirements

## 1. Authentication & User Management
- **User Registration**: User data should be stored securely and properly
- **User Authentication**: Users should be able to sign in under 3 seconds   
- **Data Persistence**: The app should be able to retrieve user data accurately every time

## 2. Scheduling System

### Workout Management
- **Create Workout**: Create workout function should have simple, intuitive, and user-friendly design
- **Delete Workout**: Delete should ask the user to confirm before actually deleting
- **Edit Workout**: The edit workout function should update the database within 2 seconds of confirming changes

### Calendar Interface
- **Multi-view Calendar**: Calendar should load and display under 5 seconds of loading the screen

## 3. Activity Tracking

### Activity Dashboard
- **Daily Todo Display**: Todo display should be in an interactive bullet-point format, swipeable/clickable to mark completion
- **Completion Tracking**: Completed activities should be hidden from the user, easily toggled to display again
- **Activity Logging**: Users should be able to log and edit details like RPE, overall feelings, reps, sets
- **Intensity Monitoring**: Intensity levels should be displayed in red text and become bigger when warning the users to slow down/stop.
- **AI Integration**: AI suggestions should take less than 10 seconds to load 


