// Access React and ReactDOM from window
const { React } = window;
const { createRoot } = window.ReactDOM;

// Import the App component from our App.js (assuming it's globally available)
const { App } = window;

// Render the app
const root = createRoot(document.getElementById('root'));
root.render(
  React.createElement(React.StrictMode, null,
    React.createElement(App)
  )
); 