import React, { useState, useEffect } from 'react';
// Tone.js はHTMLファイル内でCDNからグローバルに読み込まれていることを想定しています。
// そのため、ここでは直接importせず、window.Tone としてアクセスします。

// Main App component
const App = () => {
  // Define the initial list of morning tasks with hiragana, icons, and completion status
  // Added 'completionTime' property to store the timestamp when a task is completed.
  const [tasks, setTasks] = useState([
    { id: 1, text: 'おきる', icon: '☀️', completed: false, completionTime: null },
    { id: 2, text: 'トイレ', icon: '🚽', completed: false, completionTime: null },
    { id: 3, text: 'はみがき', icon: '🦷', completed: false, completionTime: null },
    { id: 4, text: 'ごはん', icon: '🍽️', completed: false, completionTime: null },
    { id: 5, text: 'おきがえ', icon: '👕', completed: false, completionTime: null },
    { id: 6, text: 'ほいくえんのじゅんび', icon: '🎒', completed: false, completionTime: null },
    { id: 7, text: 'かみのけ', icon: '💇‍♀️', completed: false, completionTime: null },
    { id: 8, text: 'いってきます', icon: '👋', completed: false, completionTime: null },
  ]);

  // useEffect for starting the AudioContext on user interaction.
  // Modern browsers require a user gesture (like a click/tap) to start audio playback.
  useEffect(() => {
    // Check if Tone.js is loaded and the AudioContext is not yet running.
    if (window.Tone && Tone.context.state !== 'running') {
      // Add a one-time event listener to the document.
      // This listener will attempt to start the AudioContext when the user first interacts with the page.
      const handleUserGesture = () => {
        if (Tone.context.state !== 'running') {
          // Attempt to start the AudioContext.
          Tone.start().then(() => {
            console.log('Tone.js AudioContext started successfully.');
          }).catch(e => {
            console.error('Failed to start Tone.js AudioContext:', e);
          });
        }
        // Remove the event listener after the first interaction to prevent multiple calls.
        document.documentElement.removeEventListener('mousedown', handleUserGesture);
        document.documentElement.removeEventListener('touchstart', handleUserGesture);
      };

      // Listen for both mouse clicks and touch events to cover various devices.
      document.documentElement.addEventListener('mousedown', handleUserGesture, { once: true });
      document.documentElement.addEventListener('touchstart', handleUserGesture, { once: true });
    }
  }, []); // Empty dependency array means this effect runs once after the initial render.

  // Function to play a simple 'ping' sound using Tone.js
  const playPingSound = () => {
    // Ensure Tone.js is loaded and its AudioContext is running before attempting to play sound.
    if (window.Tone && Tone.context.state === 'running') {
      // Create a simple synthesizer (MembraneSynth is good for percussive sounds).
      const synth = new Tone.MembraneSynth().toDestination();
      // Trigger a short note (C4 for 8th note duration).
      synth.triggerAttackRelease("C4", "8n");
    } else {
      // Log a message if the audio context is not ready, for debugging purposes.
      console.log('Audio context not running or Tone.js not loaded. Cannot play sound.');
    }
  };

  // Function to toggle the completion status of a task
  const toggleTask = (id) => {
    setTasks(prevTasks => {
      // Map over the previous tasks to create an updated array.
      const updatedTasks = prevTasks.map(task => {
        // If the current task's ID matches the toggled ID, flip its 'completed' status.
        // Also, update completionTime: if becoming completed, set current time; if becoming incomplete, set to null.
        if (task.id === id) {
          const newCompletedStatus = !task.completed;
          // Set completionTime if becoming complete, otherwise null
          const newCompletionTime = newCompletedStatus ? new Date() : null;
          return { ...task, completed: newCompletedStatus, completionTime: newCompletionTime };
        }
        // Otherwise, return the task as is.
        return task;
      });

      // Find the specific task that was just toggled to check its new status.
      const toggledTask = updatedTasks.find(task => task.id === id);
      // If the task exists and its new status is 'completed', play the ping sound.
      if (toggledTask && toggledTask.completed) {
        playPingSound();
      }
      // Return the newly updated tasks array to update the state.
      return updatedTasks;
    });
  };

  // Function to reset all tasks to incomplete for a new day
  const resetTasks = () => {
    // Map over all tasks and set their 'completed' status to false and completionTime to null.
    setTasks(tasks.map(task => ({ ...task, completed: false, completionTime: null })));
  };

  // Determine if all tasks are completed by checking if every task's 'completed' status is true.
  const allTasksCompleted = tasks.every(task => task.completed);

  return (
    // Main container for the app, styled with Tailwind CSS for responsiveness and visual appeal.
    <div className="min-h-screen bg-gradient-to-br from-blue-300 to-purple-400 flex flex-col items-center justify-center p-4 font-inter text-gray-800">
      {/* App Title */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-8 text-center drop-shadow-lg leading-tight">
        ✨ じゅんびできたかな？ ✨
      </h1>

      {/* Task List Container */}
      <div className="w-full max-w-md bg-white bg-opacity-90 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-4 border-4 border-white">
        {/* Map through tasks array and render a TaskItem component for each task. */}
        {tasks.map(task => (
          <TaskItem
            key={task.id} // Unique key for React list rendering.
            task={task} // Pass the task object as a prop.
            toggleTask={toggleTask} // Pass the toggle function as a prop.
          />
        ))}

        {/* Reset Button */}
        <div className="pt-6 flex justify-center">
          <button
            onClick={resetTasks} // Attach the resetTasks function to the button's click event.
            className="w-full sm:w-auto px-6 py-3 bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white font-bold rounded-full shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-indigo-300"
          >
            ↩️ きょうのじゅんびをリセット！
          </button>
        </div>

        {/* Completion Message / Celebration */}
        {/* This block is only rendered if all tasks are completed. */}
        {allTasksCompleted && (
          <div className="mt-8 text-center p-4 bg-yellow-100 border-2 border-yellow-300 rounded-xl shadow-inner animate-bounce">
            <p className="text-3xl font-bold text-yellow-800">
              やったね！ぜんぶできたよ！ 🎉
            </p>
          </div>
        )}
      </div>

      {/* Footer / Copyright (Optional) */}
      <p className="mt-8 text-white text-sm opacity-80 text-center">
        © 2025 おかあさんとおとうさんといっしょに
      </p>
    </div>
  );
};

// TaskItem component to display an individual task
const TaskItem = ({ task, toggleTask }) => {
  // Helper function to format the time
  const formatTime = (date) => {
    if (!date) return '';
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    // Changed format to "HH:MM"
    return `${hours}:${minutes}`;
  };

  return (
    // Individual task container. Clicking it toggles the task's completion status.
    // Styles change based on whether the task is completed or not.
    <div
      onClick={() => toggleTask(task.id)}
      className={`
        flex items-center p-4 sm:p-5 rounded-2xl cursor-pointer transition-all duration-300 ease-in-out
        ${task.completed
          ? 'bg-green-100 text-gray-400 shadow-md transform scale-98 opacity-70 border-2 border-green-300'
          : 'bg-white hover:bg-blue-50 active:bg-blue-100 shadow-lg border-2 border-transparent'
        }
      `}
    >
      {/* Task Icon */}
      <div className={`
        flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center text-4xl sm:text-5xl
        rounded-full mr-4 sm:mr-6 shadow-inner transition-all duration-300
        ${task.completed ? 'bg-green-300 text-white' : 'bg-blue-100 text-blue-600'}
      `}>
        {task.icon}
      </div>

      {/* Task Hiragana Text and Completion Time */}
      <div className="flex-grow flex flex-col sm:flex-row sm:items-baseline">
        <span className={`
          text-2xl sm:text-3xl font-bold
          ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}
        `}>
          {task.text}
        </span>
        {task.completed && task.completionTime && (
          // Display "できた！" above the time when the task is completed
          <div className="flex flex-col ml-0 sm:ml-4 mt-1 sm:mt-0 whitespace-nowrap">
            <span className="text-lg sm:text-xl font-bold text-green-600">できた！</span> {/* "できた！" text */}
            <span className="text-xl sm:text-2xl text-gray-500 font-semibold">
              {formatTime(task.completionTime)}
            </span>
          </div>
        )}
      </div>

      {/* Checkmark or Empty Circle */}
      <div className={`
        flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 border-4 rounded-full flex items-center justify-center transition-all duration-300
        ${task.completed
          ? 'bg-green-500 border-green-500' // Green background and border for completed tasks
          : 'bg-white border-blue-200'    // White background and light blue border for incomplete tasks
        }
      `}>
        {task.completed && (
          // Checkmark SVG for completed tasks, visually indicating completion.
          <svg
            className="w-6 h-6 sm:w-8 sm:h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
    </div>
  );
};

export default App;