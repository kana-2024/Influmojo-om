# 🔧 User Management Page

A simple web-based user management tool for the Influ Mojo app. This allows you to view and delete user profiles from the database for testing purposes.

## 🚀 How to Use

### 1. Open the Page
Simply double-click on `user-management.html` to open it in your web browser. No server setup required!

### 2. Features
- **View All Users**: See all registered users in the database
- **Search Users**: Filter users by name, email, or phone number
- **User Statistics**: View total users, Google users, and phone users
- **Delete Users**: Remove users and all their related data from the database
- **Real-time Updates**: Refresh the page to see the latest data

### 3. User Information Displayed
- User name and ID
- Authentication provider (Google/Phone)
- Email and phone number (with verification status)
- User type (creator/brand)
- Account status (active/pending/suspended)
- Creation date

### 4. Delete User Process
1. Click the "🗑️ Delete" button next to any user
2. Confirm the deletion in the popup dialog
3. The user and all related data will be permanently removed
4. The page will automatically refresh to show updated data

## ⚠️ Important Notes

- **Permanent Deletion**: Deleting a user removes ALL their data including:
  - User profile
  - Creator/Brand profile
  - Portfolio items
  - Packages
  - KYC information
  - Social media accounts
  - Phone verifications

- **Testing Purpose**: This tool is designed for development/testing only
- **No Authentication**: This page has no authentication - keep it secure
- **Database Connection**: Requires your backend server to be running

## 🔗 API Endpoints Used

- `GET /api/auth/users` - Get all users
- `DELETE /api/auth/delete-user` - Delete a specific user

## 🎨 Features

- **Responsive Design**: Works on desktop and mobile
- **Real-time Search**: Filter users as you type
- **Visual Status Indicators**: Color-coded status badges
- **Confirmation Dialogs**: Prevent accidental deletions
- **Error Handling**: Clear error messages for failed operations

## 🛠️ Technical Details

- **Frontend**: Pure HTML/CSS/JavaScript (no frameworks)
- **Backend**: Node.js/Express with Prisma ORM
- **Database**: PostgreSQL
- **CORS**: Configured for ngrok development

## 🔒 Security Considerations

- This page should only be used in development
- Consider adding authentication for production use
- The page connects directly to your ngrok URL
- All operations are logged in the backend console

## 🚨 Troubleshooting

### Page won't load users
- Check if your backend server is running
- Verify the ngrok URL is correct in the HTML file
- Check browser console for error messages

### Can't delete users
- Ensure the backend server is running
- Check if the user has related data that might cause foreign key constraints
- Look at the backend console for detailed error messages

### Search not working
- Make sure you're typing in the search box
- Try refreshing the page
- Check browser console for JavaScript errors

## 📱 Mobile Usage

The page is fully responsive and works great on mobile devices. You can:
- View all user information clearly
- Search and filter users
- Delete users with touch-friendly buttons
- Scroll through long lists of users

---

**Happy Testing! 🎉** 