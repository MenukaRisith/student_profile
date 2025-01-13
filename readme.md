# 🎓 **Student Profile Management System**

---

## 🚀 **Created by Menuka Risith**  
- 📧 **Email**: menuka.contact@gmail.com  
- 📞 **Phone**: +94 76 001 7055  

## ⚙️ **How to Run**

### **After Cloning the Repository:**

#### **Frontend**:
1. Navigate to the frontend directory:
   ```bash
   cd frontend
2.Install dependencies:
   ```bash
   npm install
3. Start the development server:



---

### Part 3: **Usage Instructions**

```markdown
## 🌐 **Usage Instructions**

Once all the servers are up and running, navigate to the frontend URL and try these pages:

- `/` - Search by `indexNumber` and redirect to the student's profile.
- `/login` - Login page (admin, teacher, society admin, and students can login, but can't change anything except their own features).
- `/register` - Register page for students (Teachers, admins, and society admins are manually added for security reasons).
- `/dashboard` - Dashboard for all users (Admins, Society Admins, Teachers) for generating certificates and handling other management tasks.
- `/profile/:indexNumber` - View student profiles (e.g., `/profile/272923` to test an existing profile).

## 🌟 **Live Demo**

Experience the web application at:  
👉 [https://student.eleventastic.com](https://student.eleventastic.com)

## 🛠 **Tech Stack**

- **Frontend**: Remix.js + TailwindCSS  
- **Backend** & **Blockchain**: Express.js + Node.js  
- **Database**: MySQL & JSON (for blockchain data)  
- **Version Control**: Git  

## ✨ **Some Features**

- Blockchain-based certificates
- Student data tracking
- Student report generation
- Ex-curricular activity management
- Admin dashboard for streamlined workflows
- Role-specific functionalities for teachers, society admins, and students

## 📝 **Sample Accounts**

If you create the database using the provided `database.sql` file, you can use the following sample accounts for testing:

### **Admin**
- **Email**: `admin@example.com`  
- **Password**: `psw1234`

### **Teacher**
- **Email**: `teacher@example.com`  
- **Password**: `psw1234`

### **Society Admin**
- **Email**: `societyadmin@example.com`  
- **Password**: `psw1234`

## 💡 **Note**

To test locally:
1. Login as a teacher and add an `indexNumber` in the dashboard.  
2. Register a student using the `/register` page with that `indexNumber`.  
3. Use other roles (Admin, Society Admin) to explore the functionalities.  


## 🎉 **Happy Coding!**
