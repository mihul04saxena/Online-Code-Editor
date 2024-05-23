import './App.css';
import React, { useState, useEffect } from 'react';
import AceEditor from 'react-ace';
import axios from 'axios';
import stubs from './defaultStubs';
import moment from 'moment';
import 'ace-builds/src-noconflict/mode-c_cpp';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/theme-monokai'; // Import the Monokai theme

function App() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("cpp");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState("");
  const [jobId, setJobId] = useState("");
  const [jobDetails, setJobDetails] = useState(null);
  const [theme, setTheme] = useState("light"); // Default theme is light

  useEffect(() => {
    const defaultLang = localStorage.getItem("default-language") || "cpp";
    setLanguage(defaultLang);
  }, []);

  useEffect(() => {
    setCode(stubs[language]);
  }, [language]);

  const setDefaultLanguage = () => {
    localStorage.setItem("default-language", language);
    console.log(`${language} is set as default language.`);
  }

  const renderTimeDetails = () => {
    if (!jobDetails) {
      return "";
    }
    let { submittedAt, startedAt, completedAt } = jobDetails;
    let result = "";
    submittedAt = moment(submittedAt).toString();
    result += `Job Submitted At: ${submittedAt}  `;
    if (!startedAt || !completedAt) return result;
    const start = moment(startedAt);
    const end = moment(completedAt);
    const diff = end.diff(start, "seconds", true);
    result += `Execution Time: ${diff}s`;
    return result;
  }

  const handleSubmit = async () => {
    const payload = {
      language,
      code,
    };
    try {
      setJobId("");
      setStatus("");
      setOutput("");
      setJobDetails(null);
      const { data } = await axios.post("http://localhost:8080/run", payload);
      console.log(data);
      setJobId(data.jobId);

      let intervalId = setInterval(async () => {
        const { data: dataRes } = await axios.get("http://localhost:8080/status", { params: { id: data.jobId } });
        const { success, job, error } = dataRes;
        if (success) {
          const { status: jobStatus, output: jobOutput } = job;
          setStatus(jobStatus);
          setJobDetails(job);
          if (jobStatus === "pending") return;
          setOutput(jobOutput);
          clearInterval(intervalId);
        } else {
          setStatus("Error: Please retry!");
          console.error(error);
          clearInterval(intervalId);
          setOutput(error);
        }
        console.log(dataRes);
      }, 1000);
    } catch ({ response }) {
      if (response) {
        const errMsg = response.data.stderr;
        setOutput(errMsg);
      } else {
        setOutput("Error connecting to Server!!");
      }
    }
  }

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light"); // Toggle between light and dark themes
  }

  return (
    <div className={`App ${theme}`}>
      <header className="header">
        <h1>Online Code Compiler</h1>
      </header>
      <div className="controls">
        <div>
          <label htmlFor="language">Language:</label>
          <select
            id="language"
            value={language}
            onChange={(e) => {
              const shouldSwitch = window.confirm(
                "Are you sure you want to change language? WARNING: Your current code will be lost."
              );
              if (shouldSwitch) {
                setLanguage(e.target.value);
              }
            }}
          >
            <option value="cpp">C++</option>
            <option value="py">Python</option>
          </select>
          <button className="btn btn-outline-primary set-default" onClick={setDefaultLanguage}>Set Default</button>
        </div>
        <button className="btn btn-outline-success submit-button" onClick={handleSubmit}>Submit</button>
        <button className="btn btn-outline-info theme-toggle-button" onClick={toggleTheme}>Toggle Theme</button>
      </div>
      <div className="code-editor-wrapper">
        <AceEditor
          className="code-editor"
          mode={language === 'cpp' ? 'c_cpp' : 'python'}
          theme={theme === "light" ? "github" : "monokai"} // Set the theme based on the state
          value={code}
          onChange={setCode}
          fontSize={14}
          width="50%"
          editorProps={{ $blockScrolling: true }}
        />
        <div className="output">
          <p>Status: {status}</p>
          {jobId && <p>Job ID: {jobId}</p>}
          <p>{renderTimeDetails()}</p>
          <p>Output: <br/><br/>{output}</p>
        </div>
      </div>
    </div>
  );
}

export default App;
