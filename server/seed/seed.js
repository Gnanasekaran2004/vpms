import dotenv from 'dotenv';
import bcryptjs from 'bcryptjs';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import VisitorPass from '../models/VisitorPass.js';
import ActivityLog from '../models/ActivityLog.js';

dotenv.config();

const doSeed = async () => {
  try {
    await connectDB();
    
    await User.deleteMany({});
    await VisitorPass.deleteMany({});
    await ActivityLog.deleteMany({});
    
    const users = [
      { name: 'Admin User', email: 'admin@vpms.com', password: 'Admin@12345678', role: 'Administrator', department: 'Management', phone: '+12345678901' },
      { name: 'Receptionist User', email: 'receptionist@vpms.com', password: 'Recept@1234567', role: 'Receptionist', department: 'Front Desk', phone: '+12345678902' },
      { name: 'Alice Employee', email: 'alice@vpms.com', password: 'Emp@123456789', role: 'Employee', department: 'Engineering', phone: '+12345678903' },
      { name: 'Bob Employee', email: 'bob@vpms.com', password: 'Emp@123456789', role: 'Employee', department: 'Human Resources', phone: '+12345678904' },
      { name: 'Carol Williams', email: 'carol@vpms.com', password: 'Emp@123456789', role: 'Employee', department: 'Finance', phone: '+12345678905' },
      { name: 'David Brown', email: 'david@vpms.com', password: 'Emp@123456789', role: 'Employee', department: 'Marketing', phone: '+12345678906' },
      { name: 'Eve Davis', email: 'eve@vpms.com', password: 'Emp@123456789', role: 'Employee', department: 'Operations', phone: '+12345678907' }
    ];
    
    let arr = [];
    for (let i=0; i<users.length; i++) {
      let u = new User(users[i]);
      let saved = await u.save();
      arr.push(saved);
    }
    
    let admin = null;
    let rec = null;
    let emp = null;

    for(let i=0; i<arr.length; i++) {
        if(arr[i].role == 'Administrator') admin = arr[i];
        if(arr[i].role == 'Receptionist') rec = arr[i];
        if(arr[i].role == 'Employee') emp = arr[i];
    }
    
    let now = new Date();
    
    const v = [
      { visitorName: 'John Doe', visitorPhone: '+12133734250', visitorEmail: 'john@example.com', employeeToVisit: emp._id, visitDate: new Date(now.getTime() + 86400000), expectedArrivalTime: new Date(now.getTime() + 86400000 + 3600000), purposeOfVisit: 'Meeting', status: 'Pending', createdBy: rec._id },
      { visitorName: 'Jane Smith', visitorPhone: '+12133734251', visitorEmail: 'jane@example.com', employeeToVisit: emp._id, visitDate: new Date(), expectedArrivalTime: new Date(), purposeOfVisit: 'Interview', status: 'Approved', createdBy: rec._id },
      { visitorName: 'Mike Johnson', visitorPhone: '+12133734252', visitorEmail: 'mike@example.com', employeeToVisit: emp._id, visitDate: new Date(), expectedArrivalTime: new Date(), purposeOfVisit: 'Delivery', status: 'CheckedIn', checkInTime: new Date(), createdBy: rec._id },
      { visitorName: 'Sara Connor', visitorPhone: '+12133734253', visitorEmail: 'sara@example.com', employeeToVisit: emp._id, visitDate: new Date(now.getTime() - 86400000), expectedArrivalTime: new Date(now.getTime() - 86400000), purposeOfVisit: 'Consultation', status: 'CheckedOut', checkInTime: new Date(now.getTime() - 86400000), checkOutTime: new Date(now.getTime() - 86400000 + 7200000), createdBy: rec._id },
      { visitorName: 'Tom Hanks', visitorPhone: '+12133734254', visitorEmail: 'tom@example.com', employeeToVisit: emp._id, visitDate: new Date(), expectedArrivalTime: new Date(), purposeOfVisit: 'Pitch', status: 'Rejected', remarks: 'Not available today', createdBy: rec._id },
      { visitorName: 'Emma Watson', visitorPhone: '+12133734255', visitorEmail: 'emma@example.com', employeeToVisit: emp._id, visitDate: new Date(now.getTime() + 172800000), expectedArrivalTime: new Date(now.getTime() + 172800000), purposeOfVisit: 'Networking', status: 'Cancelled', createdBy: rec._id },
      { visitorName: 'Bruce Wayne', visitorPhone: '+12133734256', visitorEmail: 'bruce@example.com', employeeToVisit: emp._id, visitDate: new Date(), expectedArrivalTime: new Date(now.getTime() + 3600000), purposeOfVisit: 'Investment', status: 'Pending', createdBy: rec._id },
      { visitorName: 'Clark Kent', visitorPhone: '+12133734257', visitorEmail: 'clark@example.com', employeeToVisit: emp._id, visitDate: new Date(now.getTime() + 86400000 * 3), expectedArrivalTime: new Date(now.getTime() + 86400000 * 3), purposeOfVisit: 'Press', status: 'Approved', createdBy: rec._id },
      { visitorName: 'Diana Prince', visitorPhone: '+12133734258', visitorEmail: 'diana@example.com', employeeToVisit: emp._id, visitDate: new Date(), expectedArrivalTime: new Date(), purposeOfVisit: 'Artifact delivery', status: 'CheckedIn', checkInTime: new Date(), createdBy: rec._id },
      { visitorName: 'Barry Allen', visitorPhone: '+12133734259', visitorEmail: 'barry@example.com', employeeToVisit: emp._id, visitDate: new Date(now.getTime() - 172800000), expectedArrivalTime: new Date(now.getTime() - 172800000), purposeOfVisit: 'Lab tour', status: 'CheckedOut', checkInTime: new Date(now.getTime() - 172800000), checkOutTime: new Date(now.getTime() - 172800000 + 3600000), createdBy: rec._id }
    ];
    
    for (let i=0; i<v.length; i++) {
      let vp = new VisitorPass(v[i]);
      let savedVp = await vp.save();
      
      let log1 = new ActivityLog({ visitorId: savedVp._id, actionPerformed: 'Created', performedBy: rec._id, timestamp: new Date(savedVp.createdAt) })
      await log1.save();
      
      if (savedVp.status == 'Approved') {
        let log2 = new ActivityLog({ visitorId: savedVp._id, actionPerformed: 'Approved', performedBy: emp._id, timestamp: new Date() })
        await log2.save();
      } else if (savedVp.status == 'CheckedIn') {
        let log3 = new ActivityLog({ visitorId: savedVp._id, actionPerformed: 'Approved', performedBy: emp._id, timestamp: new Date(new Date().getTime() - 3600000) })
        await log3.save();
        let log4 = new ActivityLog({ visitorId: savedVp._id, actionPerformed: 'Checked In', performedBy: rec._id, timestamp: savedVp.checkInTime })
        await log4.save();
      } else if (savedVp.status == 'CheckedOut') {
        let log5 = new ActivityLog({ visitorId: savedVp._id, actionPerformed: 'Approved', performedBy: emp._id, timestamp: new Date(savedVp.checkInTime.getTime() - 3600000) })
        await log5.save();
        let log6 = new ActivityLog({ visitorId: savedVp._id, actionPerformed: 'Checked In', performedBy: rec._id, timestamp: savedVp.checkInTime })
        await log6.save();
        let log7 = new ActivityLog({ visitorId: savedVp._id, actionPerformed: 'Checked Out', performedBy: rec._id, timestamp: savedVp.checkOutTime })
        await log7.save();
      } else if (savedVp.status == 'Rejected') {
        let log8 = new ActivityLog({ visitorId: savedVp._id, actionPerformed: 'Rejected', performedBy: emp._id, timestamp: new Date(), notes: savedVp.remarks })
        await log8.save();
      } else if (savedVp.status == 'Cancelled') {
        let log9 = new ActivityLog({ visitorId: savedVp._id, actionPerformed: 'Cancelled', performedBy: admin._id, timestamp: new Date() })
        await log9.save();
      }
    }
    
    console.log('Seed complete!');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

doSeed();
