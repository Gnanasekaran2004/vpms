import dotenv from 'dotenv';
import bcryptjs from 'bcryptjs';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import VisitorPass from '../models/VisitorPass.js';
import ActivityLog from '../models/ActivityLog.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await connectDB();
    
    await User.deleteMany({});
    await VisitorPass.deleteMany({});
    await ActivityLog.deleteMany({});
    
    const userDefinitions = [
      {
        name: 'Admin User',
        email: 'admin@vpms.com',
        password: 'Admin@12345678',
        role: 'Administrator',
        department: 'Management',
        phone: '+12345678901'
      },
      {
        name: 'Receptionist User',
        email: 'receptionist@vpms.com',
        password: 'Recept@1234567',
        role: 'Receptionist',
        department: 'Front Desk',
        phone: '+12345678902'
      },
      {
        name: 'Alice Employee',
        email: 'alice@vpms.com',
        password: 'Emp@123456789',
        role: 'Employee',
        department: 'Engineering',
        phone: '+12345678903'
      },
      {
        name: 'Bob Employee',
        email: 'bob@vpms.com',
        password: 'Emp@123456789',
        role: 'Employee',
        department: 'Human Resources',
        phone: '+12345678904'
      },
      { name: 'Carol Williams', email: 'carol@vpms.com', password: 'Emp@123456789', role: 'Employee', department: 'Finance', phone: '+12345678905' },
      { name: 'David Brown', email: 'david@vpms.com', password: 'Emp@123456789', role: 'Employee', department: 'Marketing', phone: '+12345678906' },
      { name: 'Eve Davis', email: 'eve@vpms.com', password: 'Emp@123456789', role: 'Employee', department: 'Operations', phone: '+12345678907' }
    ];
    
    const createdUsers = [];
    
    for (const userData of userDefinitions) {
      const newUser = new User(userData);
      const savedUser = await newUser.save();
      createdUsers.push(savedUser);
    }
    
    const adminUser = createdUsers.find(user => user.role === 'Administrator');
    const receptionistUser = createdUsers.find(user => user.role === 'Receptionist');
    const employeeUser = createdUsers.find(user => user.role === 'Employee');
    
    const currentDate = new Date();
    
    const visitorDefinitions = [
      {
        visitorName: 'John Doe',
        visitorPhone: '+12133734250',
        visitorEmail: 'john@example.com',
        employeeToVisit: employeeUser._id,
        visitDate: new Date(currentDate.getTime() + 86400000),
        expectedArrivalTime: new Date(currentDate.getTime() + 86400000 + 3600000),
        purposeOfVisit: 'Meeting',
        status: 'Pending',
        createdBy: receptionistUser._id
      },
      {
        visitorName: 'Jane Smith',
        visitorPhone: '+12133734251',
        visitorEmail: 'jane@example.com',
        employeeToVisit: employeeUser._id,
        visitDate: new Date(),
        expectedArrivalTime: new Date(),
        purposeOfVisit: 'Interview',
        status: 'Approved',
        createdBy: receptionistUser._id
      },
      {
        visitorName: 'Mike Johnson',
        visitorPhone: '+12133734252',
        visitorEmail: 'mike@example.com',
        employeeToVisit: employeeUser._id,
        visitDate: new Date(),
        expectedArrivalTime: new Date(),
        purposeOfVisit: 'Delivery',
        status: 'CheckedIn',
        checkInTime: new Date(),
        createdBy: receptionistUser._id
      },
      {
        visitorName: 'Sara Connor',
        visitorPhone: '+12133734253',
        visitorEmail: 'sara@example.com',
        employeeToVisit: employeeUser._id,
        visitDate: new Date(currentDate.getTime() - 86400000),
        expectedArrivalTime: new Date(currentDate.getTime() - 86400000),
        purposeOfVisit: 'Consultation',
        status: 'CheckedOut',
        checkInTime: new Date(currentDate.getTime() - 86400000),
        checkOutTime: new Date(currentDate.getTime() - 86400000 + 7200000),
        createdBy: receptionistUser._id
      },
      {
        visitorName: 'Tom Hanks',
        visitorPhone: '+12133734254',
        visitorEmail: 'tom@example.com',
        employeeToVisit: employeeUser._id,
        visitDate: new Date(),
        expectedArrivalTime: new Date(),
        purposeOfVisit: 'Pitch',
        status: 'Rejected',
        remarks: 'Not available today',
        createdBy: receptionistUser._id
      },
      {
        visitorName: 'Emma Watson',
        visitorPhone: '+12133734255',
        visitorEmail: 'emma@example.com',
        employeeToVisit: employeeUser._id,
        visitDate: new Date(currentDate.getTime() + 172800000),
        expectedArrivalTime: new Date(currentDate.getTime() + 172800000),
        purposeOfVisit: 'Networking',
        status: 'Cancelled',
        createdBy: receptionistUser._id
      },
      {
        visitorName: 'Bruce Wayne',
        visitorPhone: '+12133734256',
        visitorEmail: 'bruce@example.com',
        employeeToVisit: employeeUser._id,
        visitDate: new Date(),
        expectedArrivalTime: new Date(currentDate.getTime() + 3600000),
        purposeOfVisit: 'Investment',
        status: 'Pending',
        createdBy: receptionistUser._id
      },
      {
        visitorName: 'Clark Kent',
        visitorPhone: '+12133734257',
        visitorEmail: 'clark@example.com',
        employeeToVisit: employeeUser._id,
        visitDate: new Date(currentDate.getTime() + 86400000 * 3),
        expectedArrivalTime: new Date(currentDate.getTime() + 86400000 * 3),
        purposeOfVisit: 'Press',
        status: 'Approved',
        createdBy: receptionistUser._id
      },
      {
        visitorName: 'Diana Prince',
        visitorPhone: '+12133734258',
        visitorEmail: 'diana@example.com',
        employeeToVisit: employeeUser._id,
        visitDate: new Date(),
        expectedArrivalTime: new Date(),
        purposeOfVisit: 'Artifact delivery',
        status: 'CheckedIn',
        checkInTime: new Date(),
        createdBy: receptionistUser._id
      },
      {
        visitorName: 'Barry Allen',
        visitorPhone: '+12133734259',
        visitorEmail: 'barry@example.com',
        employeeToVisit: employeeUser._id,
        visitDate: new Date(currentDate.getTime() - 172800000),
        expectedArrivalTime: new Date(currentDate.getTime() - 172800000),
        purposeOfVisit: 'Lab tour',
        status: 'CheckedOut',
        checkInTime: new Date(currentDate.getTime() - 172800000),
        checkOutTime: new Date(currentDate.getTime() - 172800000 + 3600000),
        createdBy: receptionistUser._id
      }
    ];
    
    for (const visitorData of visitorDefinitions) {
      const newVisitorPass = new VisitorPass(visitorData);
      const savedVisitorPass = await newVisitorPass.save();
      
      const creationLog = new ActivityLog({
        visitorId: savedVisitorPass._id,
        actionPerformed: 'Created',
        performedBy: receptionistUser._id,
        timestamp: new Date(savedVisitorPass.createdAt)
      });
      await creationLog.save();
      
      if (savedVisitorPass.status === 'Approved') {
        const approveLog = new ActivityLog({
          visitorId: savedVisitorPass._id,
          actionPerformed: 'Approved',
          performedBy: employeeUser._id,
          timestamp: new Date()
        });
        await approveLog.save();
      } else if (savedVisitorPass.status === 'CheckedIn') {
        const approveLog = new ActivityLog({
          visitorId: savedVisitorPass._id,
          actionPerformed: 'Approved',
          performedBy: employeeUser._id,
          timestamp: new Date(new Date().getTime() - 3600000)
        });
        await approveLog.save();
        
        const checkInLog = new ActivityLog({
          visitorId: savedVisitorPass._id,
          actionPerformed: 'Checked In',
          performedBy: receptionistUser._id,
          timestamp: savedVisitorPass.checkInTime
        });
        await checkInLog.save();
      } else if (savedVisitorPass.status === 'CheckedOut') {
        const approveLog = new ActivityLog({
          visitorId: savedVisitorPass._id,
          actionPerformed: 'Approved',
          performedBy: employeeUser._id,
          timestamp: new Date(savedVisitorPass.checkInTime.getTime() - 3600000)
        });
        await approveLog.save();
        
        const checkInLog = new ActivityLog({
          visitorId: savedVisitorPass._id,
          actionPerformed: 'Checked In',
          performedBy: receptionistUser._id,
          timestamp: savedVisitorPass.checkInTime
        });
        await checkInLog.save();
        
        const checkOutLog = new ActivityLog({
          visitorId: savedVisitorPass._id,
          actionPerformed: 'Checked Out',
          performedBy: receptionistUser._id,
          timestamp: savedVisitorPass.checkOutTime
        });
        await checkOutLog.save();
      } else if (savedVisitorPass.status === 'Rejected') {
        const rejectLog = new ActivityLog({
          visitorId: savedVisitorPass._id,
          actionPerformed: 'Rejected',
          performedBy: employeeUser._id,
          timestamp: new Date(),
          notes: savedVisitorPass.remarks
        });
        await rejectLog.save();
      } else if (savedVisitorPass.status === 'Cancelled') {
        const cancelLog = new ActivityLog({
          visitorId: savedVisitorPass._id,
          actionPerformed: 'Cancelled',
          performedBy: adminUser._id,
          timestamp: new Date()
        });
        await cancelLog.save();
      }
    }
    
    console.log('Seed complete!');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedDatabase();
