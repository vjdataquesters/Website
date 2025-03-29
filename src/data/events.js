// Event format
// name, eventId, image, date, venue, timings, pics, winners, outcome, register, description, link, isGFormEmbeddable, externalDownloads
// isGFormEmbeddable is a boolean value that tells whether the event has a google form or not
// it is not embeddable if it contains "file upload" feature

/**
 * interface Event {
 *    name: string;
 *    eventId: string;
 *    category: string;
 *    image: string;
 *    date: string;
 *    venue: string;
 *    timings: string;
 *    pics: string[];
 *    winners?: string;
 *    outcome?: string;
 *    register?: string;
 *    description: string;
 *    link: string;
 *    isGFormEmbeddable: boolean;
 *    externalDownloads?: {
 *     [key: string]: string; // download file pointer
 *    }
 * }
 */

// type of category shall be restricted to the specified values

// type EventCategory =
//   | 'Workshop'
//   | 'Hackathon'
//   | 'Fun Event'
//   | 'Creative competition'
//   | 'Technical Fest'
//   | 'Guest Lecture';

const events = {
  upcoming: [
    {
      name: "Cloud Craft",
      eventId: "cloud-craft",
      image: "/events/CloudCraft2025/img1.png",
      date: "April 7th & 8th 2025",
      venue: "APJ Abdul Kalam Auditorium",
      timings: "10:00 AM to 4:00 PM",
      pics: ["/events/CloudCraft2025/img1.png"],
      // winners:"",
      // outcome:
      //   "",
      register: "http://localhost:5173/register",
      isGFormEmbeddable: false,
      event_tags: ["Workshop", "Cloud", "AWS"],
      description:
        "A 2 day workshop on Cloud computing concepts,with hands-on practice of AWS",
      link: "/events/cloud-craft",
    },
  ],
  past: {
    e2025: [
      {
        name: "Hit Reloaded",
        eventId: "hit-reloaded",
        image: "/events/HitReloaded2025/img1.png",
        date: "February 21st 2025",
        venue: "Sinti Stage",
        timings: "10:00 AM to 3:00 PM",
        pics: [
          "/events/HitReloaded2025/img1.png",
          "/events/HitReloaded2025/img2.jpg",
          "/events/HitReloaded2025/img3.jpg",
          "/events/HitReloaded2025/img4.jpg",
        ],
        winners:
          "<b>1st prize:-</b>Team AKATSUKI<br>22071A1289- Kandre Navadeep <br>22071A1288- K. Sathwik Reddy <br>22071A12B5- Sangulge Prudhvi Raj<br><b>2nd prize:-</b> Team PURPLE PINK SKIES<br>Bhavana Sree Naidu Yeluri - 22071A66D9<br>Sharan Teja Charagondla - 22071A66E3<br>Sai Sathya Thota - 22071A66J9<br><b>3rd prize:-</b> Team BYSTANDERS<br>Pranathi - 24071A67C2<br>Tanmayee - 24071A67C8 <br>Vaibhav - 24071A67D1",
        outcome:
          "A day of thrilling puzzles and collaborative problem-solving culminates in the crowning of code-cracking champions at HIT: RELOADED.  The event leaves participants with sharpened minds and a taste for adventure, contributing to the vibrant atmosphere of Convergence 2025.",
        // register:
        //   "https://docs.google.com/forms/d/e/1FAIpQLSeQkrnEppaak4C1xEkDCHhJZEjBXXWkGwnHsQPSC3qDhqXo0A/viewform",
        isGFormEmbeddable: false,
        event_tags: ["Fun Event", "Teasure Hunt"],
        description:
          "HIT - Reloaded is an adrenaline-fueled treasure hunt for teams of 3-4. Solve riddles and puzzles through multiple checkpoints, starting with a briefing and first clue. The fastest team to crack the final puzzle wins. Join us on February 21, 2025, from 10 AM to 3 PM at Sinti Stage, VNRVJIET.",
        link: "/events/hit-reloaded",
      },
      {
        name: "DV CONTEST",
        eventId: "dv-contest",
        image: "/events/DVContest2025/img1.png",
        date: "February 21st 2025",
        venue: "APJ Abdul Kalam Auditorium",
        timings: "1:00 PM to 4:00 PM",
        pics: [
          "/events/DVContest2025/img1.png",
          "/events/DVContest2025/img2.jpg",
          "/events/DVContest2025/img3.jpg",
          "/events/DVContest2025/img4.jpg",
        ],
        winners:
          "<b>1st prize-</b>(Team- Versatile ones)\nSai Kruthik Royal Pasam<br>Tadapaneni Sriram\n\n<b>2nd prize-</b>(Team- tech hounds)<br>Pettem Akhilvarsh<br>Pichika Kushal\n\n<b>3rd prize-</b>(Team- Data Alchemist)<br>Nishant P<br>Sathvik V\n\n<b>Consolidation prize-</b>( Team- Analyze for change)<br>Bhargav Tammana<br>Ratna Jashwanth Yamar",
        outcome:
          "Data wizards transform raw numbers into compelling stories at the data visualization competition.  Real-world challenges are tackled, prizes awarded, and resumes boosted.  Convergence 2025 witnesses the rise of data-driven insights.",
        // register:
        //   "https://docs.google.com/forms/d/e/1FAIpQLSe-ug9pGIVPhA73gX9Z3-c8I05h-K0xlkV6ro1nrCFsanZjFw/viewform",
        isGFormEmbeddable: false,
        event_tags: ["Data Science", "Competition", "Design"],
        description:
          "DV CONTEST 2K25: Visualize. Analyze. Compete. is a Data Visualization Contest on February 21, 2025, at VNRVJIET's APJ Abdul Kalam Auditorium. Teams of two will transform raw data into visual stories for prizes and recognition",
        link: "/events/dv-contest",
      },
      {
        name: "MAP-AN-APP",
        eventId: "map-an-app",
        image: "/events/MapAnApp2025/img1.png",
        date: "February 22nd 2025",
        venue: "APJ Abdul Kalam Auditorium",
        timings: "9:30 AM to 1:00 PM",
        pics: [
          "/events/MapAnApp2025/img1.png",
          "/events/MapAnApp2025/img2.jpg",
          "/events/MapAnApp2025/img3.jpg",
        ],
        winners:
          "<b>1st Place:</b>\n<b>Team name:</b> Tech hounds<br><b>Members:</b><br>Akhil Varsh (CSE-DS B 2ndyear) (24075A6710)<br>P.Kushal (CSE-B 3rd year) (23075A0513)\n\n<b>2nd Place:</b>\n<b>Team name:</b> winner winner chicken dinner<br><b>Members:</b><br>Bhavishwa reddy (AIDS 2nd year) (23071A7251)<br>Gurram Karthik (AIDS 2nd year) (23071A7228) <br>",
        outcome:
          "At MAP-AN-APP, future developers innovate and prototype, creating solutions for healthcare and fintech.  Top performers earn internships, and Convergence 2k25 showcases the next generation of apps.",
        // register:
        //   "https://docs.google.com/forms/d/e/1FAIpQLSe-3Ptjj8AVS_vO-d-7WiWjKb8CDWs40yNvR3YaWpNceX1kFw/viewform",
        isGFormEmbeddable: false,
        event_tags: [
          "App Development",
          "Competition",
          "Internship Opportunities",
        ],
        description:
          "MAP-AN-APP at Convergence 2k25 is on February 22, 2025, at VNRVJIET's APJ Abdul Kalam Auditorium (9:30 AM-1:00 PM). Teams of two will develop apps in Healthcare & Fintech themes for a ₹3500 prize pool and internship opportunities. Convergence pass required",
        link: "/events/map-an-app",
      },
      {
        name: "LANGVISION",
        eventId: "langvision2025",
        image: "/events/LangVision/img1.jpg",
        date: "February 14th & 15th 2025",
        venue: "E-238 & 239, VNRVJIET",
        timings: "10:00 AM to 4:30 PM",
        pics: [
          "/events/LangVision/img1.jpg",
          "/events/LangVision/img5.jpg",
          "/events/LangVision/img3.jpg",
          "/events/LangVision/img4.jpg",
        ],
        outcome:
          "LANGVISION - Exploring Large Language Models and Vector Search was an exciting two-day hands-on workshop that brought together students from all years to explore the power of Large Language Models (LLMs),Retrieval-Augmented Generation (RAG), and Vector Search.The objectives of the event were:\n\n● To introduce students to the fundamentals of LLMs, transformers, and tokenization\n● To explore real-world applications like ChatGPT and Gemini.\n● To Deploy a fine-tuned model on Hugging Face and build a Streamlit app using it.\n● To familiarize participants with accessing pre-trained LLMs via the Hugging Face access tokens.\n● To introduce LoRA (Low-Rank Adaptation) for efficient fine-tuning of LLMs.\n● To guide participants in preprocessing resume data to train an AI model for resume evaluation.\n● To explain the limitations of LLMs alone and the role of RAG in retrieving external knowledge.\n● To familiarize participants with relevant interview questions on LLMs and RAG.",
        // register: "https://forms.gle/imgsks2miQkZWHvu5",
        isGFormEmbeddable: false,
        event_tags: ["Artificial Intelligence", "LLMs", "Workshop"],
        description:
          "The event “LANGVISION - Shaping the Future of Gen AI & LLMs” will be held on February 14th and 15th. This hands-on workshop features Pranali Bose, a Machine Learning Engineer at DBS Bank, providing insights into Generative AI and Large Language Models",
        link: "/events/langvision2025",
        externalDownloads: {
          "Workshop Code":
            "https://github.com/vjdataquesters/LangVisionWorkshop/archive/refs/heads/main.zip",
          "Streamlit Guide":
            "https://raw.githubusercontent.com/vjdataquesters/events-material/main/streamlit-workshop-guide.pdf",
          "Resume Analyzer":
            "https://github.com/vjdataquesters/Resume_App/archive/refs/heads/main.zip",
        },
      },
    ],
    e2024: [
      {
        name: "GET SET PY",
        eventId: "getsetpy",
        image: "/events/GetSetPy/img1.png",
        date: "October 25th & 26th 2024",
        venue: "APJ Abdul Kalam Auditorium",
        timings: "10:00 AM to 4:40 PM",
        pics: [
          "/events/GetSetPy/img1.png",
          "/events/GetSetPy/img2.png",
          "/events/GetSetPy/img3.png",
          "/events/GetSetPy/img4.png",
        ],
        outcome:
          "GET SET PY - A Hands-on Journey with Python was a two-day interactive workshop conducted on October 25th and 26th at the APJ Abdul Kalam Auditorium. Led by Mr. Mahammad Jebibulla, an experienced software developer, the event provided students with practical skills in Python and its applications in data science and machine learning. The objectives of event were: \n\n● To introduce students to Python programming and its applications in data science and machine learning\n● To provide hands-on experience with Python libraries like Numpy and Pandas\n● To enhance students' programming skills and problem-solving abilities\n● To familiarize participants with machine learning basics, including linear regression.\n ● To guide participants through building simple applications using Streamlit and Flask. \n",
        // register: "https://docs.google.com/forms/d/e/1FAIpQLScOUxYMQyb-j2XGP1g6IPR6zocaQl14X9BNm5W8BuUQiV_Jwg/viewform",
        event_tags: ["Data Science", "Machine Learning", "Workshop"],
        description:
          "The event “GET SET PY - A Hands-on Journey with Python” was held on October 25th and 26th from 10:00 AM to 4:40 PM at the APJ Abdul Kalam Auditorium. The two day workshop featured Mr. Mahammad Jebibulla, a Software Developer with expertise in Machine Learning and Python-based development.",
        link: "/events/getsetpy",
        isGFormEmbeddable: false,
        externalDownloads: {
          "Python Installation Guide":
            "https://raw.githubusercontent.com/vjdataquesters/events-material/refs/heads/main/Python%20Installation%20Guide.pdf",
          "Numpy Material":
            "https://raw.githubusercontent.com/vjdataquesters/events-material/refs/heads/main/Numpy.ipynb",
          "Pandas Material":
            "https://raw.githubusercontent.com/vjdataquesters/events-material/refs/heads/main/Pandas.ipynb",
        },
      },
      {
        name: "Mastering Tableau: Senior Track ",
        eventId: "tableau-senior-track",
        image: "/events/TableauSeniorTrack/img1.png",
        date: "October 19th 2024",
        venue: "PEB seminar hall",
        timings: "10:00 AM to 4:30 PM",
        pics: [
          "/events/TableauSeniorTrack/img1.png",
          "/events/TableauSeniorTrack/img2.png",
          "/events/TableauSeniorTrack/img3.png",
          "/events/TableauSeniorTrack/img4.png",
        ],
        outcome:
          "With over 120 participants, the event was a huge success. The participants learned Tableau and Power BI, Data Visualization, and Dashboard Creation. Student feedback was overwhelmingly positive, with many expressing interest in future events. The primary objectives of Mastering Tableau: Senior Track event were\n● Gain practical experience in data visualization tools like Tableau and Power-Bi\n● confidently apply these tools for effective data interpretation and presentation.\n● To strengthen participants' foundational knowledge in data analysis and visualization, \n● Enhance their skills in data analysis and interpretation\n",
        // register: "https://docs.google.com/forms/d/e/1FAIpQLSc7JB5a9yvN8Xvz8lsng2FpTLuYJkm6UWyqPjzn-k2v8cpJfg/viewform",
        event_tags: ["Data Visualization", "Tableau", "Workshop"],
        description:
          "Mastering Tableau: Senior Track was a full-day event held on October 19, 2024, from 10:00 a.m. to 4:30 p.m. at VNRVJIET, in P-401 P-402 labs. This hands-on event was structured to enhance the skills of senior students and professionals in data visualization, focusing on the practical application of Power BI and Tableau.",
        link: "/events/tableau-senior-track",
        isGFormEmbeddable: true,
      },
      {
        name: "SIH 2024",
        eventId: "sih2024",
        image: "/events/SIH2024/img1.png",
        date: "August 31th 2024",
        venue: "Patrons Bhavan",
        timings: "09:00 AM to 5:00 PM",
        pics: ["/events/SIH2024/img1.png"],
        outcome: "",
        // register: "https://forms.gle/odWZTNgKkLVraaFC8",
        event_tags: ["Hackathon", "Innovation", "Problem Solving"],
        description:
          "The internal round of Smart India Hackathon (SIH) commences, organized with VJ Data Questers and Krithomedh. Teams will address real-world challenges. This national competition showcases student innovation and problem-solving prowess.",
        link: "/events/sih2024",
      },
      {
        name: "Profolio",
        eventId: "profolio",
        image: "/events/Profolio/img1.png",
        date: "August 27th 2024",
        venue: "B005, B006, P401, P402, C106 labs",
        timings: "10:00 AM to 4:40 PM",
        pics: [
          "/events/Profolio/img2.png",
          "/events/Profolio/img3.png",
          "/events/Profolio/img4.png",
          "/events/Profolio/img5.png",
          "/events/Profolio/img6.png",
        ],
        winners:
          "<b>1st</b> Gandham Jayaditya - https://jayadityagandham9.wixstudio.io/jayaditya\n<b>2nd</b> Mudiam Nehal Reddy - https://portfolio-bay-xi-27.vercel.app\n<b>3rd</b> Sai abhijith - https://sai-abhijith.vercel.app/\n<b>4th</b> Sai Abhi Varshini - https://alex-portfolio-gold.vercel.app/ \n<b>5th</b> Kunta Varshith Reddy - https://varshithreddykunta.wixsite.com/varshith\n",
        outcome:
          "<b>Event Overview</b>\n●Showcase their skills\n●Network with peers\n●Gain exposure\n\n <b>Event Objectives</b>\n●Promote creativity and innovation in the field of web design\n●Recognize and reward outstanding portfolio websites\n●Foster a collaborative and supportive community among designers.\n●Inspire and motivate aspiring designers to pursue their passion for web design\n\nNo of Students Registered: <b>190</b>\nNo of Students Participated: <b>119</b>",
        // register: "https://docs.google.com/forms/d/e/1FAIpQLSeK8VVFHNDJf84_MPiWryVybIN-cZS6KByLol6RM45H9-JjGA/viewform?embedded=true",
        event_tags: ["Web Design", "Portfolio", "Workshop"],
        description:
          "The Portfolio Creation Event offers students a chance to develop and present professional portfolios using identical data sets. Judging focuses on quality and professionalism, providing valuable experience and feedback in a crucial career skill.",
        link: "/events/profolio",
      },
      {
        name: "Sneaky Memer",
        eventId: "sneakyMemer",
        image: "/events/SneakyMemer/img1.png",
        date: "Since August 9th 2024",
        venue: "Online",
        timings: "All day",
        pics: [
          "/events/SneakyMemer/img1.png",
          "/events/SneakyMemer/img2.png",
          "/events/SneakyMemer/img3.png",
        ],
        winners:
          "<b>1st</b> Srinikethan(23071A67A2)\n<b>2nd</b> Balaji (22071A6796)\n",
        outcome:
          "The Sneaky Memer event is designed to engage students in a creative and educational experience by integrating humor with technical knowledge. Through this event, participants will:\n● Enhance their creative skills by contributing original meme ideas that will be shared on our social media platforms.\n● Gain recognition for their creativity and wit as their memes are featured and attributed to them.\n● Deepen their understanding of data science and AI by participating in interactive quizzes posted on our stories.\n● Foster a sense of community and healthy competition as they strive to be among the first to correctly answer quiz questions.\n● Build a stronger connection with our social media presence, contributing to an active and engaged online community.",
        // register: "https://forms.gle/h16fiJjPaoW3Yrcj7",
        event_tags: ["Fun Event", "Creativity", "Humor"],
        description:
          "Join the VJ DataQuesters'  Sneaky Memer, our social media event where your creativity and technical skills collide!Submit your funniest meme ideas, and see them featured on our official page!  Don't miss out!",
        link: "/events/sneakyMemer",
      },
      {
        name: "Technovista",
        eventId: "technovista2024",
        image: "/events/Technovista2024/img1.png",
        date: "June 10th - 12th 2024",
        venue: "VNR",
        timings: "9am - 5pm",
        pics: [
          "/events/Technovista2024/img1.png",
          "/events/Technovista2024/img3.png",
        ],
        outcome: "",
        event_tags: ["Technical Fest", "Coding", "Hackathon"],
        description:
          "TechnoVista is a premier collaborative event organized by the Data Science and Cyber Security Clubs, offering a diverse range of activities including a coding contest, cyber hunt, red teaming exercise, case study competition, hackathon, project expo, tech elocution, and guest lectures.",
        link: "/events/tv24",
      },
      {
        name: "DATA VISUALIZATION USING TABLEAU",
        eventId: "tableau2k24",
        image: "/events/Tableau2k24/img1.png",
        date: "March 21st 2024",
        venue: "P Block, p-401,402",
        timings: "10:00 am - 4:30 pm",
        pics: [
          "/events/Tableau2k24/img1.png",
          "/events/Tableau2k24/img2.png",
          "/events/Tableau2k24/img3.png",
          "/events/Tableau2k24/img4.png",
        ],
        outcome:
          "The workshop aims to equip second-year college students with the fundamental skills to create compelling and informative data visualizations using Tableau. By participating in this workshop, students will: \n● Understand the importance of data visualization and its impact on communication.\n● Gain proficiency in connecting Tableau to various data sources.\n● Master the creation of well-structured and informative dashboards.\n● Learn best practices for designing dashboards that effectively communicate insights.\n● Become familiar with and be able to create basic visualization types, including bar charts, line charts, and pie charts.\n",
        event_tags: ["Data Visualization", "Tableau", "Workshop"],
        description:
          "VJ DATA QUESTERS conducted a workshop on Data Visualization using Tableau for 2nd year Data Science students. The workshop was conducted by Mr. Gullapalli Sathar",
        link: "/events/tableau2k24",
      },
      {
        name: "LTI Mind Tree DS Guest Lecture",
        eventId: "ltiGuestLecture2024",
        image: "/events/LtiMindTreeDS2024/img1.png",
        date: "March 20th 2024",
        venue: "APJ Abdul kalam Auditorium",
        timings: "11:00 am - 12:30 pm",
        pics: [
          "/events/LtiMindTreeDS2024/img2.png",
          "/events/LtiMindTreeDS2024/img3.png",
          "/events/LtiMindTreeDS2024/img4.png",
          "/events/LtiMindTreeDS2024/img5.png",
        ],
        outcome:
          "The Data Science workshop was a hit! participants got a taste of Data Science's complete insights from What is Data? to Life Cycle of Data Science. Thanks to the faculty and student coordinators, participants left buzzing with ideas and excited about the roles in Data Science. We express our sincere appreciation for joining the technical event we aim to provifde awareness to attendees on Data Science we are heartful for the successful participation of attendees.",
        event_tags: ["Data Science", "Guest Lecture"],
        description:
          "We VJ DATA QUESTERS organised a Guest lecture on oppurtunities in Data Science for 3rd-year Data Science students.The Guest Lecture was organised by Mrs. Dr. N. Sunanda and Mr. P. Veeranjaneyulu, our faculty coordinators.",
        link: "/events/ltiGuestLecture2024",
      },
      {
        name: "HIT -  THE SECOND CHASE",
        eventId: "hitThe2ndChase",
        image: "/events/HitThe2ndChase/img1.png",
        date: "February 11th 2024",
        venue: "online",
        timings: "4:00 pm - 7:00 pm",
        pics: [
          "/events/HitThe2ndChase/img1.png",
          "/events/HitThe2ndChase/img2.png",
          "/events/HitThe2ndChase/img3.png",
        ],
        winners:
          "<b>1st</b> Maneesh Vemula (23071A04B0)\n<b>2nd</b> Parthu (23071A6647)\n<b>3rd</b> Gajawada Rohith (22071A7215)\n<b>4th</b> Mahesh Kumar (23071A05GB)\n",
        outcome:
          "<strong>Promote Problem-Solving Skills</strong>: The event will challenge participants to improve their problem-solving abilities through various activities, including reasoning, aptitude tests, puzzles, and technical questions. \n<strong>Foster Critical Thinking</strong>: By presenting participants with questions and puzzles, the event will encourage critical thinking and analytical reasoning. This will help them approach problems from different angles and develop effective solutions. \n<strong>Test Technical Knowledge</strong>: The event will include technical questions to assess participants' understanding and proficiency in relevant subject areas. This will encourage continuous learning and knowledge acquisition.",
        event_tags: ["Fun Event", "Problem Solving", "Critical Thinking"],
        description:
          "We VJ DATA QUESTERS conducted a HIT-THE SECOND CHASE for students of 1st and 2nd years of our college, to find the final treasure",
        link: "/events/hitThe2ndChase",
      },
    ],
    e2023: [
      {
        name: "BLOG-A-THON",
        eventId: "blogAThon",
        image: "/events/BlogAThon2023/img1.png",
        date: "December 15th 2023",
        venue: "A201, C106, B112/1",
        timings: "10:00am to 12:00pm",
        pics: [
          "/events/BlogAThon2023/img1.png",
          "/events/BlogAThon2023/img2.png",
          "/events/BlogAThon2023/img3.png",
        ],
        winners:
          "<b>Total Participants in First Round:</b> 142 Teams\n<b>Total Participants in Second Round:</b> 51 Teams\n\n<b>Software Blog winners\n1st place:</b> \nQuantum computing - RS \nhttps://medium.com/@siddharthakumargade2910/quantum-computing-a2db46ecb09a\n<b>2nd Place:</b>\nBiometric and security A deep dive - Anikalla Sarika Reddy \nhttps://medium.com/@sarikareddyanikalla178/biometric-advanced-way-of-security-3ba2d6b98fbd\n\n<b>Hardware Blog winners\n1st Place:</b> \nHydroponics A soilless revolution - SS \nhttps://medium.com/p/2b06aa5c94a0/edit\n<b>2nd Place:</b> \nGround vehicle system - Baeverse \nhttps://medium.com/@22071a0250/ground-vehicle-systems-a-glimpse-into-the-wheels-of-innovation-1c2bef35d95f",
        outcome:
          "The BLOG-A-THON attracted a significant number of participants, showcasing the enthusiasm for technical writing among the audience. Participants explored various technical subjects and presented them in unique and creative ways, enriching the overall knowledge base. The competition provided a valuable platform for participants to improve their writing and communication skills, particularly under pressure. Participants and judges alike expressed appreciation for the format and objectives of the BLOG-A-THON highlighting its contribution to the fest.",
        event_tags: ["Creative competition", "Technical Writing"],
        description:
          "The Event BLOG-A-THON is conducted as part of the Convergence on 14th, 15th of December. The BLOG-A-THON was a two-round competition aimed at encouraging participants to express their technical knowledge and passion through creative writing.",
        link: "/events/blogAThon",
      },
      {
        name: "VJ DATA QUESTERS ORIENTATION 2023",
        eventId: "vjdqOrientation2023",
        image: "/events/VjdqOrientation2023/image.png",
        date: "November 23rd 2023",
        venue: "APJ AUDITORIUM",
        timings: "9:00 am - 2:00 pm",
        pics: [
          "/events/VjdqOrientation2023/img1.png",
          "/events/VjdqOrientation2023/img2.png",
          "/events/VjdqOrientation2023/img3.png",
          "/events/VjdqOrientation2023/img4.png",
        ],
        outcome:
          "\n<strong>Introducing the Club</strong> : Ensure that new members understand the purpose, mission, and activities of the club.\n<strong>Fostering a Sense of Community</strong>: Help new members feel welcome and integrated by facilitating introductions and encouraging participation in icebreaker activities.\n<strong>Providing Information</strong>: Share essential information about club meetings, events, membership requirements, and expectations (attendance, participation, dues/fees).\n<strong>Explaining Opportunities for Involvement</strong>: Inform new members about the various ways they can get involved, such as joining committees, volunteering for events, or running for leadership positions.\n<strong>Promoting Engagement</strong>: Encourage new members to ask questions, share their interests, and provide feedback.\n",
        event_tags: ["Fun Event", "Orientation"],
        description:
          "VJ DATA QUESTERS hosted an ORIENTATION for 2023 1st year students of our college. ",
        link: "/events/vjdqOrientation2023",
      },
      {
        name: "HIT - THE 1ST CHASE ",
        eventId: "hitThe1stChase",
        image: "/events/HitThe1stChase/img1.png",
        date: "February 11th 2023",
        venue: "online",
        timings: "3:00 pm - 4:00 pm",
        pics: [
          "/events/HitThe1stChase/img1.png",
          "/events/HitThe1stChase/img4.png",
          "/events/HitThe1stChase/img2.png",
          "/events/HitThe1stChase/img3.png",
        ],
        winners:
          "<b>1st,2nd and 3rd are awarded with cash prize of 700,500,300 respectively</b>.\n<b>WINNER-</b> Shruthika Sunku (CSE-AIML)\n<b>1st RUNNER UP</b>- G.Tanishq (CSE-CYS)\n<b>2nd RUNNER UP-</b> Rishith Kumar Reddy(CSE-AIML)",
        outcome:
          "Through this event we made our juniors to solve problems on reasoning, aptitude, puzzles and technical questions. We first released a clue in our official Instagram page based on that they are directed to the next clue which is another Instagram page. These clues are provided in the form of questions or puzzles. In this process they may have loops and redirections according to the map. The first person who reaches the destination is the winner of the game. We got total of 300 registrations and 150 among them are participated in the event.",
        event_tags: ["Fun Event", "Problem Solving"],
        description:
          "VJ DATA QUESTERS conducted a HIT-THE FIRST CHASE for students of 1st and 2nd years of our college , to find the final treasure",
        link: "/events/hitThe1stChase",
      },
      {
        name: "A GUEST LECTURE ON DATA SCIENCE JOURNEY IN 2023",
        eventId: "guestLecture2023",
        image: "/events/GuestLectureDS2023/img1.png",
        date: "February 8th 2023",
        venue: "KS Auditorium",
        timings: "10:00 am - 12:00 pm",
        pics: [
          "/events/GuestLectureDS2023/img1.png",
          "/events/GuestLectureDS2023/img2.png",
          "/events/GuestLectureDS2023/img3.png",
        ],
        outcome:
          "This guest lecture on data science provided attendees with new insights into the field and its applications. This can help them deepen their understanding of data science and gain a better appreciation of its importance. The guest lecture had inspired attendees to pursue a career or further education in data science. They may gain a better understanding of the potential impact of data science in various industries and be motivated to explore opportunities in the field. This guest lecture can be an excellent opportunity to meet other professionals who are working on data science. Attendees can network with the speaker.",
        event_tags: ["Data Science", "Guest Lecture"],
        description:
          "We VJ DATA QUESTERS conducted a Guest lecture on data science journey in 2023 for students of 1st , 2nd and 3rd  years data science students of our college , to know the career in data science",
        link: "/events/guestLecture2023",
      },
    ],
  },
};
export default events;
