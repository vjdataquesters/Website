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
      name: "LANGVISION",
      eventId: "langvision2025",
      category: "Workshop",
      image: "/events/LangVision/img1.jpg",
      date: "February 14th & 15th 2025",
      venue: "PEB seminar hall",
      timings: "10:00 AM to 4:30 PM",
      pics: ["/events/LangVision/img1.jpg"],
      outcome: "",
      register: "https://forms.gle/imgsks2miQkZWHvu5",
      isGFormEmbeddable: false,
      description:
        "The event “LANGVISION - Shaping the Future of Gen AI & LLMs” will be held on February 14th and 15th. This hands-on workshop features Pranali Bose, a Machine Learning Engineer at DBS Bank, providing insights into Generative AI and Large Language Models",
      link: "/events/langvision2025",
      isLimitedRegistrations: true,
    },
  ],
  past: {
    e2024: [
      {
        name: "GET SET PY",
        eventId: "getsetpy",
        category: "Workshop",
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
        description:
          "The event “GET SET PY - A Hands-on Journey with Python” was held on October 25th and 26th from 10:00 AM to 4:40 PM at the APJ Abdul Kalam Auditorium. The two day workshop featured Mr. Mahammad Jebibulla, a Software Developer with expertise in Machine Learning and Python-based development.",
        link: "/events/getsetpy",
        isGFormEmbeddable: false,
        externalDownloads: {
          "Python Installation Guide":
            "https://raw.githubusercontent.com/vjdataquesters/getsetpy/refs/heads/main/Python%20Installation%20Guide.pdf",
          "Numpy Material":
            "https://raw.githubusercontent.com/vjdataquesters/getsetpy/refs/heads/main/Numpy.ipynb",
          "Pandas Material":
            "https://raw.githubusercontent.com/vjdataquesters/getsetpy/refs/heads/main/Pandas.ipynb",
        },
      },
      {
        name: "Mastering Tableau: Senior Track ",
        eventId: "tableau-senior-track",
        category: "Workshop",
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
        description:
          "Mastering Tableau: Senior Track was a full-day event held on October 19, 2024, from 10:00 a.m. to 4:30 p.m. at VNRVJIET, in P-401 P-402 labs. This hands-on event was structured to enhance the skills of senior students and professionals in data visualization, focusing on the practical application of Power BI and Tableau.",
        link: "/events/tableau-senior-track",
        isGFormEmbeddable: true,
      },
      {
        name: "SIH 2024",
        eventId: "sih2024",
        category: "Hackathon",
        image: "/events/SIH2024/img1.png",
        date: "August 31th 2024",
        venue: "Patrons Bhavan",
        timings: "09:00 AM to 5:00 PM",
        pics: ["/events/SIH2024/img1.png"],
        outcome: "",
        // register: "https://forms.gle/odWZTNgKkLVraaFC8",
        description:
          "The internal round of Smart India Hackathon (SIH) commences, organized with VJ Data Questers and Krithomedh. Teams will address real-world challenges. This national competition showcases student innovation and problem-solving prowess.",
        link: "/events/sih2024",
      },
      {
        name: "Profolio",
        eventId: "profolio",
        category: "Workshop",
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
        description:
          "The Portfolio Creation Event offers students a chance to develop and present professional portfolios using identical data sets. Judging focuses on quality and professionalism, providing valuable experience and feedback in a crucial career skill.",
        link: "/events/profolio",
      },
      {
        name: "Sneaky Memer",
        eventId: "sneakyMemer",
        category: "Fun Event",
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
        description:
          "Join the VJ DataQuesters'  Sneaky Memer, our social media event where your creativity and technical skills collide!Submit your funniest meme ideas, and see them featured on our official page!  Don't miss out!",
        link: "/events/sneakyMemer",
      },
      {
        name: "Technovista",
        eventId: "technovista2024",
        category: "Technical Fest",
        image: "/events/Technovista2024/img1.png",
        date: "June 10th - 12th 2024",
        venue: "VNR",
        timings: "9am - 5pm",
        pics: [
          "/events/Technovista2024/img1.png",
          "/events/Technovista2024/img3.png",
        ],
        outcome: "",
        description:
          "TechnoVista is a premier collaborative event organized by the Data Science and Cyber Security Clubs, offering a diverse range of activities including a coding contest, cyber hunt, red teaming exercise, case study competition, hackathon, project expo, tech elocution, and guest lectures.",
        link: "/events/tv24",
      },
      {
        name: "DATA VISUALIZATION USING TABLEAU",
        eventId: "tableau2k24",
        category: "Workshop",
        image: "/events/Tableau2k24/img1.png",
        date: "21-03-2024",
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
        description:
          "VJ DATA QUESTERS conducted a workshop on Data Visualization using Tableau for 2nd year Data Science students. The workshop was conducted by Mr. Gullapalli Sathar",
        link: "/events/tableau2k24",
      },
      {
        name: "LTI Mind Tree DS Guest Lecture",
        eventId: "ltiGuestLecture2024",
        category: "Guest Lecture",
        image: "/events/LtiMindTreeDS2024/img1.png",
        date: "20-03-2024",
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
        description:
          "We VJ DATA QUESTERS organised a Guest lecture on oppurtunities in Data Science for 3rd-year Data Science students.The Guest Lecture was organised by Mrs. Dr. N. Sunanda and Mr. P. Veeranjaneyulu, our faculty coordinators.",
        link: "/events/ltiGuestLecture2024",
      },
      {
        name: "HIT -  THE SECOND CHASE",
        eventId: "hitThe2ndChase",
        category: "Fun Event",
        image: "/events/HitThe2ndChase/img1.png",
        date: "11-02-2024",
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
        description:
          "We VJ DATA QUESTERS conducted a HIT-THE SECOND CHASE for students of 1st and 2nd years of our college, to find the final treasure",
        link: "/events/hitThe2ndChase",
      },
    ],
    e2023: [
      {
        name: "BLOG-A-THON",
        eventId: "blogAThon",
        category: "Creative competition",
        image: "/events/BlogAThon2023/img1.png",
        date: "15-12-2023",
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
        description:
          "The Event BLOG-A-THON is conducted as part of the Convergence on 14th, 15th of December. The BLOG-A-THON was a two-round competition aimed at encouraging participants to express their technical knowledge and passion through creative writing.",
        link: "/events/blogAThon",
      },
      {
        name: "VJ DATA QUESTERS ORIENTATION 2023",
        eventId: "vjdqOrientation2023",
        category: "Fun Event",
        image: "/events/VjdqOrientation2023/image.png",
        date: "23-11-2023",
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
        description:
          "VJ DATA QUESTERS hosted an ORIENTATION for 2023 1st year students of our college. ",
        link: "/events/vjdqOrientation2023",
      },
      {
        name: "HIT - THE 1ST CHASE ",
        eventId: "hitThe1stChase",
        category: "Fun Event",
        image: "/events/HitThe1stChase/img1.png",
        date: "11-02-2023",
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
        description:
          "VJ DATA QUESTERS conducted a HIT-THE FIRST CHASE for students of 1st and 2nd years of our college , to find the final treasure",
        link: "/events/hitThe1stChase",
      },
      {
        name: "A GUEST LECTURE ON DATA SCIENCE JOURNEY IN 2023",
        eventId: "guestLecture2023",
        category: "Guest Lecture",
        image: "/events/GuestLectureDS2023/img1.png",
        date: "08-02-2023",
        venue: "KS Auditorium",
        timings: "10:00 am - 12:00 pm",
        pics: [
          "/events/GuestLectureDS2023/img1.png",
          "/events/GuestLectureDS2023/img2.png",
          "/events/GuestLectureDS2023/img3.png",
        ],
        outcome:
          "This guest lecture on data science provided attendees with new insights into the field and its applications. This can help them deepen their understanding of data science and gain a better appreciation of its importance. The guest lecture had inspired attendees to pursue a career or further education in data science. They may gain a better understanding of the potential impact of data science in various industries and be motivated to explore opportunities in the field. This guest lecture can be an excellent opportunity to meet other professionals who are working on data science. Attendees can network with the speaker.",
        description:
          "We VJ DATA QUESTERS conducted a Guest lecture on data science journey in 2023 for students of 1st , 2nd and 3rd  years data science students of our college , to know the career in data science",
        link: "/events/guestLecture2023",
      },
    ],
  },
};
export default events;
