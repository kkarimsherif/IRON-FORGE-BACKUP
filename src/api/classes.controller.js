const Class = require('../models/class.model');
const User = require('../models/user.model');
const { sendNotification } = require('./notifications.controller');

/**
 * Get all gym classes
 * Access: Public
 */
exports.getAllClasses = async (req, res, next) => {
  try {
    // Build query
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(field => delete queryObj[field]);
    
    // Simple filtering
    if (queryObj.date) {
      const date = new Date(queryObj.date);
      date.setHours(0, 0, 0, 0);
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      
      queryObj.date = { $gte: date, $lt: nextDay };
    }
    
    // Convert query to MongoDB format
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    
    // Build query
    let query = Class.find(JSON.parse(queryStr));
    
    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('date startTime');
    }
    
    // Field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
    
    // Execute query
    const classes = await query;
    const totalCount = await Class.countDocuments(JSON.parse(queryStr));
    
    res.status(200).json({
      success: true,
      results: classes.length,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      data: {
        classes
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get a specific class
 * Access: Public
 */
exports.getClass = async (req, res, next) => {
  try {
    const gymClass = await Class.findById(req.params.id);
    
    if (!gymClass) {
      return res.status(404).json({
        success: false,
        message: 'No class found with that ID'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        class: gymClass
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new class
 * Access: Admin and trainers
 */
exports.createClass = async (req, res, next) => {
  try {
    // If trainer is not provided, set current user as trainer
    if (!req.body.trainer && req.user.role === 'trainer') {
      req.body.trainer = req.user.id;
    }
    
    const newClass = await Class.create(req.body);
    
    // Notify the trainer about the new class assignment
    if (req.body.trainer) {
      const trainer = await User.findById(req.body.trainer);
      
      if (trainer && trainer._id.toString() !== req.user.id) {
        await sendNotification({
          title: 'New Class Assignment',
          message: `You have been assigned to teach ${newClass.name} on ${new Date(newClass.date).toLocaleDateString()}`,
          type: 'class',
          user: trainer._id,
          priority: 'normal',
          reference: {
            model: 'Class',
            id: newClass._id
          },
          action: {
            url: `/classes/${newClass._id}`,
            text: 'View Details'
          }
        });
      }
    }
    
    res.status(201).json({
      success: true,
      data: {
        class: newClass
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update a class
 * Access: Admin and the assigned trainer
 */
exports.updateClass = async (req, res, next) => {
  try {
    const gymClass = await Class.findById(req.params.id);
    
    if (!gymClass) {
      return res.status(404).json({
        success: false,
        message: 'No class found with that ID'
      });
    }
    
    // Check if user is admin or the assigned trainer
    if (req.user.role !== 'admin' && 
        gymClass.trainer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this class'
      });
    }
    
    // Store original values for notification purposes
    const originalTrainer = gymClass.trainer;
    const originalDate = new Date(gymClass.date);
    const originalTime = gymClass.startTime;
    const originalDuration = gymClass.duration;
    const originalMaxCapacity = gymClass.maxCapacity;
    
    // Update the class
    const updatedClass = await Class.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    // Check if trainer was changed
    if (req.body.trainer && req.body.trainer !== originalTrainer.toString()) {
      // Notify the new trainer
      await sendNotification({
        title: 'New Class Assignment',
        message: `You have been assigned to teach ${updatedClass.name} on ${new Date(updatedClass.date).toLocaleDateString()}`,
        type: 'class',
        user: req.body.trainer,
        priority: 'normal',
        reference: {
          model: 'Class',
          id: updatedClass._id
        },
        action: {
          url: `/classes/${updatedClass._id}`,
          text: 'View Details'
        }
      });
      
      // Notify the previous trainer if it's not the current user
      if (originalTrainer.toString() !== req.user.id) {
        await sendNotification({
          title: 'Class Assignment Removed',
          message: `You are no longer assigned to teach ${updatedClass.name} on ${new Date(updatedClass.date).toLocaleDateString()}`,
          type: 'class',
          user: originalTrainer,
          priority: 'normal',
          reference: {
            model: 'Class',
            id: updatedClass._id
          }
        });
      }
    }
    
    // Check if date, time, or duration changed
    const dateChanged = updatedClass.date.getTime() !== originalDate.getTime();
    const timeChanged = updatedClass.startTime !== originalTime;
    const durationChanged = updatedClass.duration !== originalDuration;
    
    // If schedule changed, notify all enrolled students
    if (dateChanged || timeChanged || durationChanged) {
      const newDate = new Date(updatedClass.date).toLocaleDateString();
      const newTime = updatedClass.startTime;
      
      // Get all enrolled users
      const enrolledUsers = gymClass.attendees.map(attendee => attendee.user);
      
      for (const userId of enrolledUsers) {
        await sendNotification({
          title: 'Class Schedule Changed',
          message: `Your class "${updatedClass.name}" has been rescheduled to ${newDate} at ${newTime}`,
          type: 'class',
          user: userId,
          priority: 'high',
          reference: {
            model: 'Class',
            id: updatedClass._id
          },
          action: {
            url: `/classes/${updatedClass._id}`,
            text: 'View Updated Class'
          }
        });
      }
    }
    
    // If max capacity was decreased and now there are more enrolled than allowed
    if (req.body.maxCapacity && 
        req.body.maxCapacity < originalMaxCapacity && 
        gymClass.attendees.length > req.body.maxCapacity) {
      
      // Notify admin about potential overbooking
      const admins = await User.find({ role: 'admin' }).select('_id');
      
      if (admins.length > 0) {
        await sendNotification({
          title: 'Class Capacity Alert',
          message: `Class "${updatedClass.name}" now has more enrollments (${gymClass.attendees.length}) than its new capacity (${req.body.maxCapacity})`,
          type: 'class',
          user: admins[0]._id,
          priority: 'high',
          reference: {
            model: 'Class',
            id: updatedClass._id
          },
          action: {
            url: `/admin/classes/${updatedClass._id}`,
            text: 'Review Class'
          }
        });
      }
    }
    
    res.status(200).json({
      success: true,
      data: {
        class: updatedClass
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a class
 * Access: Admin only
 */
exports.deleteClass = async (req, res, next) => {
  try {
    const gymClass = await Class.findById(req.params.id);
    
    if (!gymClass) {
      return res.status(404).json({
        success: false,
        message: 'No class found with that ID'
      });
    }
    
    // Notify enrolled users
    if (gymClass.attendees.length > 0) {
      const className = gymClass.name;
      const classDate = new Date(gymClass.date).toLocaleDateString();
      
      for (const attendee of gymClass.attendees) {
        await sendNotification({
          title: 'Class Cancelled',
          message: `We're sorry, but the ${className} class on ${classDate} has been cancelled.`,
          type: 'class',
          user: attendee.user,
          priority: 'high',
          reference: {
            model: 'Class',
            id: gymClass._id
          }
        });
      }
    }
    
    // Notify the trainer if it's not the current user
    if (gymClass.trainer.toString() !== req.user.id) {
      await sendNotification({
        title: 'Class Cancelled',
        message: `The ${gymClass.name} class on ${new Date(gymClass.date).toLocaleDateString()} has been cancelled.`,
        type: 'class',
        user: gymClass.trainer,
        priority: 'high'
      });
    }
    
    // Delete the class
    await Class.findByIdAndDelete(req.params.id);
    
    res.status(204).json({
      success: true,
      data: null
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Enroll in a class
 * Access: Any authenticated user
 */
exports.enrollClass = async (req, res, next) => {
  try {
    const gymClass = await Class.findById(req.params.id);
    
    if (!gymClass) {
      return res.status(404).json({
        success: false,
        message: 'No class found with that ID'
      });
    }
    
    // Check if class is full
    if (gymClass.attendees.length >= gymClass.maxCapacity) {
      return res.status(400).json({
        success: false,
        message: 'This class is already at full capacity'
      });
    }
    
    // Check if user is already enrolled
    const alreadyEnrolled = gymClass.attendees.some(
      attendee => attendee.user.toString() === req.user.id
    );
    
    if (alreadyEnrolled) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this class'
      });
    }
    
    // Check if class has already happened
    const classDate = new Date(gymClass.date);
    classDate.setHours(
      parseInt(gymClass.startTime.split(':')[0]),
      parseInt(gymClass.startTime.split(':')[1])
    );
    
    if (classDate < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot enroll in a class that has already happened'
      });
    }
    
    // Add user to attendees
    gymClass.attendees.push({
      user: req.user.id,
      enrolled: new Date(),
      attended: false
    });
    
    await gymClass.save();
    
    // Send notification to confirm enrollment
    await sendNotification({
      title: 'Class Enrollment Confirmed',
      message: `You've successfully enrolled in ${gymClass.name} on ${new Date(gymClass.date).toLocaleDateString()} at ${gymClass.startTime}`,
      type: 'class',
      user: req.user.id,
      priority: 'normal',
      reference: {
        model: 'Class',
        id: gymClass._id
      },
      action: {
        url: `/classes/${gymClass._id}`,
        text: 'View Class'
      }
    });
    
    // If class is now at 75% capacity or more, notify trainer
    const capacityPercentage = (gymClass.attendees.length / gymClass.maxCapacity) * 100;
    if (capacityPercentage >= 75) {
      await sendNotification({
        title: 'Class Filling Up',
        message: `Your ${gymClass.name} class is now at ${Math.round(capacityPercentage)}% capacity`,
        type: 'class',
        user: gymClass.trainer,
        priority: 'normal',
        reference: {
          model: 'Class',
          id: gymClass._id
        }
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        class: gymClass
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Cancel enrollment in a class
 * Access: Any authenticated user for their own enrollment
 */
exports.cancelEnrollment = async (req, res, next) => {
  try {
    const gymClass = await Class.findById(req.params.id);
    
    if (!gymClass) {
      return res.status(404).json({
        success: false,
        message: 'No class found with that ID'
      });
    }
    
    // Check if user is enrolled
    const attendeeIndex = gymClass.attendees.findIndex(
      attendee => attendee.user.toString() === req.user.id
    );
    
    if (attendeeIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'You are not enrolled in this class'
      });
    }
    
    // Check if class starts within 24 hours
    const classDate = new Date(gymClass.date);
    classDate.setHours(
      parseInt(gymClass.startTime.split(':')[0]),
      parseInt(gymClass.startTime.split(':')[1])
    );
    
    const hoursDiff = (classDate - new Date()) / (1000 * 60 * 60);
    
    if (hoursDiff < 24 && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'You cannot cancel enrollment within 24 hours of the class'
      });
    }
    
    // Remove user from attendees
    gymClass.attendees.splice(attendeeIndex, 1);
    await gymClass.save();
    
    // Send notification to confirm cancellation
    await sendNotification({
      title: 'Class Enrollment Cancelled',
      message: `You've cancelled your enrollment in ${gymClass.name} on ${new Date(gymClass.date).toLocaleDateString()}`,
      type: 'class',
      user: req.user.id,
      priority: 'normal',
      reference: {
        model: 'Class',
        id: gymClass._id
      }
    });
    
    // If the class was previously full, notify the first user on the waitlist if there is one
    if (gymClass.waitlist && gymClass.waitlist.length > 0) {
      const nextUser = gymClass.waitlist[0];
      
      await sendNotification({
        title: 'Class Spot Available',
        message: `A spot has opened up in the ${gymClass.name} class on ${new Date(gymClass.date).toLocaleDateString()}. Enroll now to secure your spot!`,
        type: 'class',
        user: nextUser.user,
        priority: 'high',
        reference: {
          model: 'Class',
          id: gymClass._id
        },
        action: {
          url: `/classes/${gymClass._id}/enroll`,
          text: 'Enroll Now'
        }
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        class: gymClass
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Mark attendance for students
 * Access: Admin and the assigned trainer
 */
exports.markAttendance = async (req, res, next) => {
  try {
    const { attendees } = req.body;
    
    if (!attendees || !Array.isArray(attendees)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of attendees'
      });
    }
    
    const gymClass = await Class.findById(req.params.id);
    
    if (!gymClass) {
      return res.status(404).json({
        success: false,
        message: 'No class found with that ID'
      });
    }
    
    // Check if user is admin or the assigned trainer
    if (req.user.role !== 'admin' && 
        gymClass.trainer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to mark attendance for this class'
      });
    }
    
    // Update attendance for each provided attendee
    for (const entry of attendees) {
      const { userId, attended } = entry;
      
      const attendeeIndex = gymClass.attendees.findIndex(
        attendee => attendee.user.toString() === userId
      );
      
      if (attendeeIndex !== -1) {
        gymClass.attendees[attendeeIndex].attended = attended;
        
        // Send notification to user about their attendance being marked
        if (attended) {
          await sendNotification({
            title: 'Class Attendance Confirmed',
            message: `Your attendance for ${gymClass.name} on ${new Date(gymClass.date).toLocaleDateString()} has been recorded. Great job showing up!`,
            type: 'class',
            user: userId,
            priority: 'low',
            reference: {
              model: 'Class',
              id: gymClass._id
            }
          });
        }
      }
    }
    
    await gymClass.save();
    
    res.status(200).json({
      success: true,
      data: {
        class: gymClass
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get classes for a specific trainer
 * Access: Admin and the specific trainer
 */
exports.getTrainerClasses = async (req, res, next) => {
  try {
    const trainerId = req.params.trainerId;
    
    // Check if user is admin or the requested trainer
    if (req.user.role !== 'admin' && trainerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view these classes'
      });
    }
    
    // Build base query for trainer classes
    const queryObj = { trainer: trainerId };
    
    // Filter by date range if provided
    if (req.query.from && req.query.to) {
      queryObj.date = {
        $gte: new Date(req.query.from),
        $lte: new Date(req.query.to)
      };
    } else if (req.query.from) {
      queryObj.date = { $gte: new Date(req.query.from) };
    } else if (req.query.to) {
      queryObj.date = { $lte: new Date(req.query.to) };
    }
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Execute query
    const classes = await Class.find(queryObj)
      .sort('date startTime')
      .skip(skip)
      .limit(limit);
    
    const totalCount = await Class.countDocuments(queryObj);
    
    res.status(200).json({
      success: true,
      results: classes.length,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      data: {
        classes
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get classes a user is enrolled in
 * Access: Admin or the specific user
 */
exports.getUserClasses = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.user.id;
    
    // Check if user is admin or the requested user
    if (req.user.role !== 'admin' && userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view these enrollments'
      });
    }
    
    // Build query to find classes the user is enrolled in
    const classes = await Class.find({
      'attendees.user': userId
    }).sort('date startTime');
    
    res.status(200).json({
      success: true,
      results: classes.length,
      data: {
        classes
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Send class reminder notifications
 * Access: Admin only/Internal
 * Not exposed via API routes, called by scheduler
 */
exports.sendClassReminders = async () => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
    
    // Find all classes happening tomorrow
    const tomorrowsClasses = await Class.find({
      date: {
        $gte: tomorrow,
        $lt: dayAfterTomorrow
      }
    });
    
    for (const gymClass of tomorrowsClasses) {
      // Remind the trainer
      await sendNotification({
        title: 'Class Reminder',
        message: `Reminder: You are scheduled to teach ${gymClass.name} tomorrow at ${gymClass.startTime}`,
        type: 'class',
        user: gymClass.trainer,
        priority: 'normal',
        reference: {
          model: 'Class',
          id: gymClass._id
        },
        action: {
          url: `/classes/${gymClass._id}`,
          text: 'View Class'
        }
      });
      
      // Remind enrolled students
      for (const attendee of gymClass.attendees) {
        await sendNotification({
          title: 'Class Reminder',
          message: `Reminder: You are enrolled in ${gymClass.name} tomorrow at ${gymClass.startTime}`,
          type: 'class',
          user: attendee.user,
          priority: 'normal',
          reference: {
            model: 'Class',
            id: gymClass._id
          },
          action: {
            url: `/classes/${gymClass._id}`,
            text: 'View Class Details'
          }
        });
      }
    }
    
    return {
      success: true,
      message: `Sent reminders for ${tomorrowsClasses.length} classes`
    };
  } catch (err) {
    console.error('Error sending class reminders:', err);
    return {
      success: false,
      error: err.message
    };
  }
}; 