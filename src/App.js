import React, { useState, useEffect, useRef } from "react";
import { FiCopy, FiDownload, FiTrash2 } from "react-icons/fi";

const App = () => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let interimText = "";
        let finalText = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalText += event.results[i][0].transcript.trim();
          } else {
            interimText += event.results[i][0].transcript.trim();
          }
        }

        // Update the transcript by removing repeated final text
        setTranscript((prevTranscript) => {
          // Split the previous transcript into words and check the last part
          const prevWords = prevTranscript.trim().split(" ");
          const newFinalWords = finalText.split(" ");

          // Only add the finalText if it's different from the last part of the previous transcript
          if (
            prevWords.slice(-newFinalWords.length).join(" ") !== newFinalWords.join(" ")
          ) {
            return prevTranscript + " " + finalText;
          }

          return prevTranscript;
        });

        setInterimTranscript(interimText);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error detected: " + event.error);
      };
    } else {
      alert("Your browser does not support speech recognition.");
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setListening(true);
      setTranscript("");
      setInterimTranscript("");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
    }
  };

  const copyToClipboard = () => {
    if (transcript) {
      navigator.clipboard.writeText(transcript);
      alert("Transcript copied to clipboard!");
    } else {
      alert("No transcript to copy.");
    }
  };

  const clearTranscript = () => {
    setTranscript("");
    setInterimTranscript("");
  };

  const downloadTranscript = () => {
    if (transcript) {
      const element = document.createElement("a");
      const file = new Blob([transcript], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = "transcript.txt";
      document.body.appendChild(element);
      element.click();
    } else {
      alert("No transcript to download.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-400 to-green-600 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-8 text-center tracking-wide">
        Speech to Text
      </h1>

      <div className="flex flex-col md:flex-row md:space-x-4 mb-6 justify-center flex-wrap space-y-3 md:space-y-0">
        <button
          className={`px-8 py-3 text-lg font-semibold rounded-lg text-white transition-all duration-300 ${
            listening ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
          }`}
          onClick={startListening}
          disabled={listening}
        >
          Start Listening
        </button>
        <button
          className={`px-8 py-3 text-lg font-semibold rounded-lg text-white transition-all duration-300 ${
            !listening ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"
          }`}
          onClick={stopListening}
          disabled={!listening}
        >
          Stop Listening
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:space-x-4 mb-8 justify-center flex-wrap space-y-3 md:space-y-0">
        <button
          className="flex items-center justify-center space-x-2 px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all duration-300"
          onClick={copyToClipboard}
        >
          <FiCopy className="text-xl" />
          <span>Copy</span>
        </button>
        <button
          className="flex items-center justify-center space-x-2 px-6 py-2 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition-all duration-300"
          onClick={clearTranscript}
        >
          <FiTrash2 className="text-xl" />
          <span>Clear</span>
        </button>
        <button
          className="flex items-center justify-center space-x-2 px-6 py-2 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transition-all duration-300"
          onClick={downloadTranscript}
        >
          <FiDownload className="text-xl" />
          <span>Download</span>
        </button>
      </div>

      <div className="w-full max-w-3xl bg-white p-6 rounded-lg shadow-xl overflow-hidden">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">Transcript:</h2>
        <div className="h-64 overflow-y-auto bg-gray-100 p-4 rounded-md border border-gray-300">
          <p className="text-lg text-gray-700">
            {transcript || "Start speaking to see the transcript..."}
          </p>
          {interimTranscript && (
            <p className="text-lg text-gray-500 italic">{interimTranscript}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
