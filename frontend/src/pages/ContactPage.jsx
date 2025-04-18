import React from "react";

const ContactPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold">Contact Page</h1>
      <p>If you have any questions, feel free to reach out!</p>
      <form className="mt-5">
        <input
          type="text"
          placeholder="Your Name"
          className="input input-bordered mb-3"
        />
        <input
          type="email"
          placeholder="Your Email"
          className="input input-bordered mb-3"
        />
        <textarea
          placeholder="Your Message"
          className="textarea textarea-bordered mb-3"
        />
        <button type="submit" className="btn btn-primary">
          Send Message
        </button>
      </form>
    </div>
  );
};

export default ContactPage;
