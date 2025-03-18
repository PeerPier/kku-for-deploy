import React, { useEffect, useState } from "react";
import "../misc/helpcentre.css";
import { fetchQuestionsAPI } from "../api/manageQAPI";
import { useNavigate } from "react-router-dom";
import { IconButton } from "@mui/material";
import { IoChevronBackOutline } from "react-icons/io5";
import BlogContent from "../components/blog.content.component";

const HelpCentre = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const fetchedQuestions = await fetchQuestionsAPI();
        if (Array.isArray(fetchedQuestions)) {
          setQuestions(fetchedQuestions);
          console.log("FAQ DEBUG",fetchedQuestions)
        } else {
          console.error("Fetched questions is not an array");
        }
      } catch (error) {
        console.error("Failed to load questions:", error);
      }
    };

    loadQuestions();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  // If searchQuery is empty, don't filter and return all questions.
  const filteredFaqs = searchQuery
    ? questions.filter((faq) =>
      faq.topic.toLowerCase().includes(searchQuery)
    )
    : questions; // Show all questions when there's no search query.

  return (
    <div className="help-centre">
      <div className="backbtn">
        <IconButton onClick={() => navigate(-1)} className="back-button">
          <IoChevronBackOutline />
        </IconButton>
      </div>

      <header className="header">
        <h1>คำถามที่พบบ่อย</h1>
        <h2>เราสามารถช่วยคุณได้อย่างไรบ้าง?</h2>
        <div className="search-bar">
          <input
            type="text"
            placeholder="ค้นหา..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </header>
      {/* 
      <div className="faq">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq, index) => (
            <div className="faq-item" key={index}>
              <details>
                <summary className="faq-question">{faq.topic}</summary>
                <div className="faq-answer">{faq.answer}</div>
              </details>
            </div>
          ))
        ) : (
          <p>ไม่พบผลลัพธ์</p> // Show message when no search results match
        )}
      </div> */}


      <div className="faq">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq, index) => (
            <div className="faq-item" key={index}>
              <details>
                <summary className="faq-question">{faq.topic}</summary>
                {/* <div className="faq-answer">{faq.answer}</div> */}

                {faq.answer &&
                typeof faq.answer === "string" &&
                (() => {
                try {
                  if (faq.answer && typeof faq.answer === "string" && faq.answer.trim().startsWith("{")) {
                    const parsedAnswer = JSON.parse(faq.answer);
                    if (
                      parsedAnswer.blocks &&
                      Array.isArray(parsedAnswer.blocks) &&
                      parsedAnswer.blocks.length > 0
                    ) {
                      return parsedAnswer.blocks.map((block: any, i: any) => (
                        <div key={i} className="my-2 md:my-8">
                          <BlogContent block={block} />
                        </div>
                      ));
                    }
                  }
                } catch (error) {
                  console.error("Failed to parse answer:", error);
                }
                return null;
                })()}

              </details>
            </div>
          ))
        ) : (
          <p>ไม่พบผลลัพธ์</p> // Show message when no search results match
        )}
      </div>

    </div>

  );
};

export default HelpCentre;
