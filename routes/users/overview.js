const express = require("express");
const app = express();
const User = require('../../models/user');
const Goal = require("../../models/goal");
const dateFormat = require('dateformat');
const now = new Date();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/users/overview', (req, res, next) => {
  const goalId = req.query.id;

  User
    .findById(req.session.currentUser._id)
    .populate('goals')
    .then((user)=>{
      var goals = user.goals.map((goal) => {
        let currentMonth = dateFormat(now,"m");
        let goalStartMonth = dateFormat(goal.startDate,"m");
        let goalEndMonth = dateFormat(goal.endDate,"m");

        let isCurrentMonth = false;
        if(goalStartMonth === currentMonth) {
          isCurrentMonth = true;
        }

        let isUpcoming = false;
        if(goalStartMonth > currentMonth) {
          isUpcoming = true;
        }

      console.log("tasks", goal.tasks);
      console.log("total Tasks are ", goal.tasks.length);

      var performedTasks = goal.tasks.filter((task)=>{
        return task.done === true;
      });
      console.log('performed Tasks', performedTasks.length);
      let percentageCompletion = 0
      if(performedTasks.length !== 0){
          percentageCompletion = Math.floor((performedTasks.length/goal.tasks.length)*100);
        }
      console.log(percentageCompletion);

      let goalExists = true;
      if(goal._id !== "") {
        goalExists = false
      }

      let openTasks = goal.tasks.length - performedTasks.length; 
      console.log('openTasks are', openTasks);

      return {
        id:goal._id,
        title:goal.title,
        tasks:goal.tasks,
        performedTasks:goal.performedTasks,
        category:goal.category,
        percentCompletion:percentageCompletion,
        dueDate:dateFormat(goal.endDate,"mediumDate"),
        goalExists:goalExists,
        isCurrentMonth:isCurrentMonth,
        isUpcoming:isUpcoming,
        openTasks:openTasks
      }
    });

    var closedGoals = goals.filter((goal)=>{
      return goal.percentCompletion === 100;
    });
    
    var openTaskCounter = 0;
    goals.forEach((goal)=>{
        openTaskCounter = openTaskCounter + goal.openTasks;
    })

    console.log('openTasks', openTaskCounter);
    console.log('closedGoals', closedGoals);
    console.log('openGOals', openGoals);

    var openGoals = user.goals.length - closedGoals.length;

        res.render('users/overview', {goals:goals, openGoals:openGoals, closedGoals:closedGoals.length, openTasks:openTaskCounter});
    })

    .catch((err)=>{
      console.log('Error while fetching goals', err);
    })
  
});

module.exports = app;