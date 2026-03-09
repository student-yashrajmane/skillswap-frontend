import React from 'react';
import { ToastContainer } from 'react-toastify';
import { BrowserRouter, Routes, Route } from 'react-router-dom'; // MISSING IMPORTS
import './App.css';
import './index.css';
import AboutPage from './AboutPage';
import LoadingPage from './LoadingPage';
import FeaturesPage from './FeaturesPage';
import ContactPage from './ContactPage';
import SignUpPage from './SignUpPage';
import SignInPage from './SignInPage';
import CreateProfile from './CreateProfilePage';
import UserDashboard from './UserDashBoard';
import AdminDashBoard from './AdminDashboard';
import MyProfile from './MyProfile';
import EditProfile from './EditProfile';
import RequestsPage from './RequetPage';
import CreateMeetingPage from './CreateMeetingPage';
import MeetingDetailsPage from './MeetingDetailsPage';
import HistoryPage from './HistoryPage';
import QuizIntro from './QuizIntro';
import QuizPage from './QuizPage';
import ResetPassword from './ResetPassword';
import UserManagement from './UserManagement';
import MeetingsManagement from './MeetingManagement';
import RequestsManagement from './RequestsManagement';
import QuizDataManagement from './QuizDataManagement';




function App() {
  return (
    
    <BrowserRouter>
   
      <Routes>
        {/* The Landing Page */}
        <Route path="/" element={<LoadingPage />} />
        
        {/* The About Page */}
        <Route path="/about" element={<AboutPage />} />
       <Route path="/features" element={<FeaturesPage />} />
       <Route path="/contact" element={<ContactPage/>}/>
         <Route path="/signup" element={<SignUpPage/>}/>
           <Route path="/signin" element={<SignInPage/>}/>
             <Route path="/create-profile" element={<CreateProfile/>}/>
             <Route path="/user-dashboard" element={<UserDashboard/>}/>
             <Route path="/admin-dashboard" element={<AdminDashBoard/>}/>
            <Route path="/my-profile" element={<MyProfile/>}/>
              <Route path="/edit-profile" element={<EditProfile/>}/>
              <Route path="/requests" element={<RequestsPage/>}/>
               <Route path="/create-meeting/:id" element={<CreateMeetingPage/>}/>
                <Route path="/meetings" element={<MeetingDetailsPage/>}/>
                 
                 <Route path="/history" element={<HistoryPage/>}/>
                 <Route path="/quiz-intro" element={<QuizIntro/>}/>
                 <Route path="/quiz/start" element={<QuizPage/>}/>
                   <Route path="/reset-password" element={<ResetPassword/>}/>
                    <Route path="/admin-users" element={<UserManagement/>}/>
                     <Route path="/admin-meetings" element={<MeetingsManagement/>}/>
                         <Route path="/admin-requests" element={<RequestsManagement/>}/>
                             <Route path="/admin-quiz" element={<QuizDataManagement/>}/>

                 
                  
      </Routes>

       <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </BrowserRouter>
  );
}

export default App;