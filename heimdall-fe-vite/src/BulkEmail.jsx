import React, { useState, useEffect } from "react";
import axios from './AxiosInstance';
import { Loader2, NotebookPen } from "lucide-react";

export default function BulkEmail() {
  const [sites, setSites] = useState([]);
  const [site, setSite] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch sites when component loads
  useEffect(() => {
    const fetchSites = async () => {
      try {
        const response = await axios.get("/api/sites");
        // const data = await response.json();
        // console.log('Sites:', response.data);
        setSites(response.data || []); // assuming API returns an array like [{ id: 1, name: "Site A" }, ...]
      } catch (err) {
        console.error("Error fetching sites:", err);
      }
    };
    fetchSites();
  }, []);

  // Fetch last 20 bulk emails
  // useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get("/api/bulk_email_history?limit=20");
        setHistory(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Error fetching email history:", err);
        setHistory([]);
      }
    };

    useEffect(() => {
      fetchHistory();
    }, []);

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const response = await axios.post("/api/send_bulk_email", {
      site_id: site,
      subject,
      body: message,
    });

    const data = response.data;
    // console.log("Response from API:", data);

    if (data.status === "error") {
      const errMsg = data.msg || "Failed to send emails";
      alert("Error sending emails: " + errMsg);
      console.error("Error details:", data.failed || null);
      return;
    }

    alert(`Emails sent successfully to ${data.sent_to} recipients!
           Failed to send to ${data.invalid_emails || null}.`);
    fetchHistory();
    setSite("");
    setSubject("");
    setMessage("");
  } catch (error) {
    console.error(error);
    if (error.response) {
      alert("Error sending emails: " + (error.response.data.msg || "Unknown error"));
    } else {
      alert("Network error or unexpected response: " + error.message);
    }
  } finally {
    setLoading(false);
  }
};

return (
  <div className="w-full max-w-5xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow p-6">
    <h2 className="text-xl font-semibold mb-4">Bulk Email</h2>

    <div className="grid grid-cols-2 gap-6">
      {/* Left Column: Form */}
      <div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Site Dropdown */}
          <div>
            <label className="block text-sm font-medium mb-1">Site</label>
            <select
              value={site}
              onChange={(e) => setSite(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring focus:ring-yellow-500"
            >
              <option value="">Select a site</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring focus:ring-yellow-500"
              placeholder="Enter subject"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 h-64 focus:ring focus:ring-yellow-500"
              placeholder="Write your message..."
            />
          </div>

          {/* Send button */}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center btn btn-warning justify-center gap-2 px-4 py-2 hover:bg-yellow-300 rounded-lg disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Emails"}
          </button>
        </form>
      </div>

      {/* Right Column: History */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow max-h-[600px] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-2">Last 20 Emails</h3>
        {history.length === 0 ? (
          <p className="text-sm text-gray-500">No emails sent yet.</p>
        ) : (
          <ul className="space-y-3">
            {history.map((email) => (
              <li key={email.id} className="border-b pb-2">
                <div className="font-medium">{email.subject}</div>
                <div className="text-xs text-gray-400">{email.site_name} | {email.sent_at} | Sent by: {email.sent_by_name}</div>
                {/* <div className="text-xs text-gray-500">{email.sent_at}</div> */}
                <div className="text-sm mt-1 truncate">{email.body}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  </div>
);

}
