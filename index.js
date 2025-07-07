
"use strict";
(async () => {
  const e = await import("react"),
    t = await import("react-dom/client");
  function r(n) {
    return n.replace(/[^a-zA-Z0-9-]/g, "");
  }
  function s(n, i) {
    const o = [
        ["#6366F1", "#A5B4FC"],
        ["#10B981", "#6EE7B7"],
        ["#F59E0B", "#FCD34D"],
        ["#EC4899", "#F9A8D4"],
        ["#8B5CF6", "#C4B5FD"],
        ["#EF4444", "#FCA5A5"],
        ["#3B82F6", "#93C5FD"],
      ],
      l = i
        .split("")
        .reduce((d, c) => c.charCodeAt(0) + ((d << 5) - d), 0),
      a = o[Math.abs(l) % o.length],
      u = n.split(" "),
      p = (
        u.length > 1 ? u[0][0] + u[1][0] : n.substring(0, 2)
      ).toUpperCase();
    return `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600" width="400" height="600">
    <defs>
      <linearGradient id="grad-${r(i)}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${a[0]};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${a[1]};stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="400" height="600" fill="url(#grad-${r(i)})" />
    <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-family="Poppins, sans-serif" font-size="120" font-weight="bold" fill="white" fill-opacity="0.8">
      ${p}
    </text>
  </svg>`)}`;
  }
  const y = {
      AI_COMMAND_SYSTEM_INSTRUCTION: `You are the voice-command processing unit for an AI Ebook Reader. Your sole task is to analyze the user's spoken command and the provided context, and then return a single, valid JSON object representing the action to be taken. You MUST ONLY respond with a JSON object. Do not add any conversational text or markdown formatting (e.g., \`\`\`json).

Here is the JSON structure you must adhere to:
{
  "action": "ACTION_TYPE",
  "payload": { ... }
}

CONTEXT:
You will be given the user's current context:
- currentBook: The title and author of the book they are currently reading, or NULL if they are in the library view.
- currentChapter: The title of the current chapter (if a book is open).
- currentPage: The current page number (if a book is open).
- library: A list of all available book titles.

COMMAND RULES:
- If 'currentBook' is NULL, you are in the Library. Only 'SWITCH_BOOK' and 'CONVERSE' actions are valid. If the user tries a reader command (like 'read', 'pause', 'next page'), you MUST return a 'CONVERSE' action explaining they need to open a book first.
- If 'currentBook' is NOT NULL, you are in the Reader. All commands are valid.

POSSIBLE ACTION_TYPES AND THEIR PAYLOADS:

1.  "READ": The user wants to start reading from the current page.
    - Requires: A book must be open.
    - Triggers: "read to me", "start reading", "read the page"
    - payload: {}

2.  "PAUSE": The user wants to pause the reading.
    - Requires: A book must be open and reading must be in progress.
    - Triggers: "pause", "stop reading", "hold on"
    - payload: {}

3.  "RESUME": The user wants to resume reading.
    - Requires: A book must be open and reading must be paused.
    - Triggers: "resume", "continue reading", "keep going"
    - payload: {}

4.  "NAVIGATE_PAGE": The user wants to go to the next or previous page.
    - Requires: A book must be open.
    - Triggers: "next page", "go to the previous page", "turn the page"
    - payload: { "pageDirection": "next" | "previous" }

5.  "NAVIGATE_CHAPTER": The user wants to switch to a specific chapter by its number (1-indexed).
    - Requires: A book must be open.
    - Triggers: "go to chapter 3", "switch to the first chapter", "open chapter two"
    - payload: { "chapterIndex": <number> } (Note: chapter index is 0-indexed in the code, so convert user's number e.g., "chapter 1" -> 0)

6.  "SWITCH_BOOK": The user wants to open a different book from their library.
    - Triggers: "read moby dick", "switch to alice in wonderland", "open the book about the white whale"
    - Find the best match from the 'library' list.
    - payload: { "bookTitle": "<string>" }

7.  "CONVERSE": The user is asking a general question, making a comment, or having a conversation that isn't a direct command.
    - Triggers: "what do you think of this chapter?", "who is ishmael?", "this is interesting"
    - payload: { "response": "<Your natural language response as a helpful reading buddy>" }

8.  "UNKNOWN": The command is ambiguous or cannot be understood.
    - Triggers: Unrelated questions, unclear commands.
    - payload: { "response": "Sorry, I didn't understand that. You can ask me to read, pause, switch books, or ask a question about the story." }

EXAMPLES:
- In Library (currentBook is NULL), user says: "read to me" -> { "action": "CONVERSE", "payload": { "response": "You need to choose a book first. Which book from your library would you like me to open?" } }
- In Library, user says: "read Moby Dick" -> { "action": "SWITCH_BOOK", "payload": { "bookTitle": "Moby Dick" } }
- In Reader, user says: "next page" -> { "action": "NAVIGATE_PAGE", "payload": { "pageDirection": "next" } }
- In Reader, user says: "what is this chapter about" -> { "action": "CONVERSE", "payload": { "response": "This chapter introduces us to Ishmael and his reasons for going to sea..." } }

Now, analyze the user's command and the provided context and return the appropriate JSON object.
`,
      AI_VOICES: [
        {
          id: "sage",
          name: "Sage (Browser)",
          description: "Wise & Insightful Friend",
          provider: "browser",
          voiceURI: "Google UK English Female",
        },
        {
          id: "explorer",
          name: "Alex (Browser)",
          description: "Curious & Adventurous Buddy",
          provider: "browser",
          voiceURI: "Google US English",
        },
        {
          id: "narrator",
          name: "Classic Narrator (Browser)",
          description: "Calm & Soothing Guide",
          provider: "browser",
          voiceURI: "Microsoft David Desktop - English (United States)",
        },
        {
          id: "rachel",
          name: "Rachel (ElevenLabs)",
          description: "Calm, Professional Companion",
          provider: "elevenlabs",
          voiceId: "21m00Tcm4TlvDq8ikWAM",
        },
        {
          id: "adam",
          name: "Adam (ElevenLabs)",
          description: "Deep, Engaging Story-Pal",
          provider: "elevenlabs",
          voiceId: "SOYHLrjzK2X1ezoPC6cr",
        },
      ],
      FONT_SIZES: [
        { name: "Small", class: "text-sm" },
        { name: "Base", class: "text-base" },
        { name: "Large", class: "text-lg" },
        { name: "XL", class: "text-xl" },
        { name: "2XL", class: "text-2xl" },
      ],
    },
    g = [
      {
        id: "moby-dick",
        title: "Moby Dick",
        author: "Herman Melville",
        coverImage: s("Moby Dick", "mobydick"),
        chapters: [
          {
            title: "Chapter 1: Loomings",
            content:
              "Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time to get to sea as soon as I can. This is my substitute for pistol and ball. With a philosophical flourish Cato throws himself upon his sword; I quietly take to the ship. There is nothing surprising in this. If they but knew it, almost all men in their degree, some time or other, cherish very nearly the same feelings towards the ocean with me. There now is your insular city of the Manhattoes, belted round by wharves as Indian isles by coral reefs—commerce surrounds it with her surf. Right and left, the streets take you waterward. Its extreme downtown is the battery, where that noble mole is washed by waves, and cooled by breezes, which a few hours previous were out of sight of land. Look at the crowds of water-gazers there.",
          },
          {
            title: "Chapter 2: The Carpet-Bag",
            content:
              "I stuffed a shirt or two into my old carpet-bag, tucked it under my arm, and started for Cape Horn and the Pacific. Quitting the good city of old Manhatto, I duly arrived in New Bedford. It was a Saturday night in December. I had striven to be nice and warm when I came into the house, and I had been rubbing my hands and stamping my feet, but all to no purpose. It was a very cold and frosty night. The sky was clear and the stars were bright. The wind was sharp and piercing. I was glad to get into a warm room, and I was glad to see a fire. I had no money to lose, so I did not care where I went. I determined to go to a cheap inn, and I was directed to one called “The Spouter-Inn,” kept by Peter Coffin. As I was walking along, I saw a light in a window, and I went up to the door and knocked. A man came to the door, and I asked him if he could give me a lodging. He said he could. I asked him what he charged, and he told me a shilling. I told him I would take it. He then led me into a little room, and he told me that I could have a bed there. I was very tired, and I was very glad to have a place to sleep.",
          },
        ],
      },
      {
        id: "alice-in-wonderland",
        title: "Alice in Wonderland",
        author: "Lewis Carroll",
        coverImage: s("Alice in Wonderland", "alice"),
        chapters: [
          {
            title: "Chapter 1: Down the Rabbit-Hole",
            content:
              "Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, “and what is the use of a book,” thought Alice “without pictures or conversations?” So she was considering in her own mind (as well as she could, for the hot day made her feel very sleepy and stupid), whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her. There was nothing so very remarkable in that; nor did Alice think it so very much out of the way to hear the Rabbit say to itself, “Oh dear! Oh dear! I shall be late!” (when she thought it over afterwards, it occurred to her that she ought to have wondered at this, but at the time it all seemed quite natural); but when the Rabbit actually took a watch out of its waistcoat-pocket, and looked at it, and then hurried on, Alice started to her feet, for it flashed across her mind that she had never before seen a rabbit with either a waistcoat-pocket, or a watch to take out of it, and burning with curiosity, she ran across the field after it, and fortunately was just in time to see it pop down a large rabbit-hole under the hedge.",
          },
          {
            title: "Chapter 2: The Pool of Tears",
            content:
              "“Curiouser and curiouser!” cried Alice (she was so much surprised, that for the moment she quite forgot how to speak good English); “now I’m opening out like the largest telescope that ever was! Good-bye, feet!” (for when she looked down at her feet, they seemed to be almost out of sight, they were getting so far off). “Oh, my poor little feet, I wonder who will put on your shoes and stockings for you now, dears? I’m sure I sha’n’t be able! I shall be a great deal too far off to trouble myself about you: you must manage the best way you can;—but I must be kind to them,” thought Alice, “or perhaps they won’t walk the way I want to go! Let me see: I’ll give them a new pair of boots every Christmas.” And she went on planning to herself how she would manage it. “They must go by the carrier,” she thought; “and how funny it’ll seem, sending presents to one’s own feet! And how odd the directions will look! Alice’s Right Foot, Esq. The Hearthrug, near the Fender, (with Alice’s love). Oh dear, what nonsense I’m talking!”",
          },
        ],
      },
    ];
  const { GoogleGenAI: m } = await import("@google/genai");
  class f {
    ai = null;
    chat = null;
    currentApiKey = null;
    initialize(n) {
      (this.ai && this.currentApiKey === n) ||
        ((this.ai = new m({ apiKey: n })),
        (this.currentApiKey = n),
        (this.chat = null));
    }
    async processCommand(n, i, o) {
      var p;
      if (!o)
        return {
          action: "UNKNOWN",
          payload: {
            response:
              "API key is missing. Please add a Google AI API key in settings.",
          },
        };
      if ((this.initialize(o), !this.ai))
        return {
          action: "UNKNOWN",
          payload: { response: "Could not initialize AI service." },
        };
      const l = i.currentBook
          ? `
- Current Book: "${i.currentBook.title}" by ${i.currentBook.author}
- Current Chapter: "${
              (p = i.currentBook.chapters[i.currentChapterIndex]) == null
                ? void 0
                : p.title
            }"
- Current Page: ${i.currentPage + 1}
`
          : `
- Current Book: NULL (User is in the library view)
`,
        a = `
CONTEXT:
${l}
- Library: [${i.library.map((d) => `"${d.title}"`).join(", ")}]

USER COMMAND: "${n}"
`;
      try {
        const u = await this.ai.models.generateContent({
          model: "gemini-2.5-flash-preview-04-17",
          contents: a,
          config: {
            systemInstruction: y.AI_COMMAND_SYSTEM_INSTRUCTION,
            responseMimeType: "application/json",
            temperature: 0,
          },
        });
        let d = u.text.trim();
        const c = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s.exec(d);
        c != null && c[2] && (d = c[2].trim());
        const h = JSON.parse(d);
        if (h.action && h.payload) return h;
        throw new Error("Invalid JSON structure received from AI.");
      } catch (u) {
        console.error("Gemini Command Processing Error:", u);
        let d =
          "Sorry, I had trouble understanding that. Could you try again?";
        return (
          u instanceof SyntaxError
            ? (d =
                "There was an issue interpreting the AI's response. Please try again.")
            : u.message && (d = `An API error occurred: ${u.message}`),
          { action: "UNKNOWN", payload: { response: d } }
        );
      }
    }
    async streamChatResponse(n, i, o, l, a) {
      if (!a) {
        o("API key is missing. Please add a Google AI API key in settings."),
          l();
        return;
      }
      if ((this.initialize(a), !this.ai)) {
        o("Could not initialize AI service."), l();
        return;
      }
      try {
        this.chat ||
          (this.chat = this.ai.chats.create({
            model: "gemini-2.5-flash-preview-04-17",
            config: {
              systemInstruction:
                "You are a helpful and friendly chat assistant inside an Ebook reader application. Engage in conversation with the user about the books they are reading or any other topic they bring up.",
            },
          }));
        const u = await this.chat.sendMessageStream({ message: n });
        for await (const d of u) i(d.text);
      } catch (u) {
        console.error("Gemini Chat Streaming Error:", u);
        let d = "An unknown error occurred during chat.";
        u instanceof Error && (d = u.message), o(d);
      } finally {
        l();
      }
    }
  }
  const S = new f();
  function w(n) {
    const { name: i, className: o, ...l } = n,
      a = {
        play: e.createElement("path", {
          strokeLinecap: "round",
          strokeLinejoin: "round",
          d: "M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z",
        }),
        pause: e.createElement("path", {
          strokeLinecap: "round",
          strokeLinejoin: "round",
          d: "M15.75 5.25v13.5m-6-13.5v13.5",
        }),
        chevronLeft: e.createElement("path", {
          strokeLinecap: "round",
          strokeLinejoin: "round",
          d: "M15.75 19.5L8.25 12l7.5-7.5",
        }),
        chevronRight: e.createElement("path", {
          strokeLinecap: "round",
          strokeLinejoin: "round",
          d: "M8.25 4.5l7.5 7.5-7.5 7.5",
        }),
        close: e.createElement("path", {
          strokeLinecap: "round",
          strokeLinejoin: "round",
          d: "M6 18L18 6M6 6l12 12",
        }),
        chat: e.createElement("path", {
          strokeLinecap: "round",
          strokeLinejoin: "round",
          d: "M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.72 3.72a1.125 1.125 0 01-1.59 0l-3.72-3.72A2.123 2.123 0 013 15.894v-4.286c0-.97.616-1.813 1.5-2.097m16.5 0a2.121 2.121 0 00-2.121-2.121H6.832a2.121 2.121 0 00-2.121 2.121",
        }),
        settings: e.createElement(
          e.Fragment,
          null,
          e.createElement("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            d: "M9.594 3.94c.09-.542.56-1.004 1.11-1.226M15 12a3 3 0 11-6 0 3 3 0 016 0z",
          }),
          e.createElement("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            d: "M19.5 12c0-2.623-1.423-4.873-3.5-6.094m-10 0c-2.077 1.22-3.5 3.47-3.5 6.094c0 3.713 3.012 6.726 6.75 6.726s6.75-3.013 6.75-6.726M19.5 12a6.726 6.726 0 00-6.75-6.726",
          })
        ),
        bookOpen: e.createElement("path", {
          strokeLinecap: "round",
          strokeLinejoin: "round",
          d: "M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6-2.292m0 0v14.25",
        }),
        moon: e.createElement("path", {
          strokeLinecap: "round",
          strokeLinejoin: "round",
          d: "M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z",
        }),
        sun: e.createElement("path", {
          strokeLinecap: "round",
          strokeLinejoin: "round",
          d: "M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-6.364-.386l1.591-1.591M3 12h2.25m.386-6.364l1.591 1.591M12 12a2.25 2.25 0 00-2.25 2.25 2.25 2.25 0 002.25 2.25 2.25 2.25 0 002.25-2.25A2.25 2.25 0 0012 12z",
        }),
        send: e.createElement("path", {
          strokeLinecap: "round",
          strokeLinejoin: "round",
          d: "M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5",
        }),
        plus: e.createElement("path", {
          strokeLinecap: "round",
          strokeLinejoin: "round",
          d: "M12 4.5v15m7.5-7.5h-15",
        }),
        key: e.createElement("path", {
          strokeLinecap: "round",
          strokeLinejoin: "round",
          d: "M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z",
        }),
        microphone: e.createElement("path", {
          strokeLinecap: "round",
          strokeLinejoin: "round",
          d: "M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m12 7.5v-1.5a6 6 0 00-6-6.75v-1.5a6.75 6.75 0 016.75 6.75v1.5a6 6 0 00-6 6.75v-1.5m0-13.5a.75.75 0 01.75.75v6a.75.75 0 01-1.5 0v-6a.75.75 0 01.75-.75z",
        }),
      };
    return e.createElement(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        fill: "none",
        viewBox: "0 0 24 24",
        strokeWidth: 1.5,
        stroke: "currentColor",
        className: o || "w-6 h-6",
        ...l,
      },
      a[i]
    );
  }
  const { default: k } = await import("uuid"),
    { default: v } = await import("pdfjs-dist/build/pdf");
  v.GlobalWorkerOptions.workerSrc =
    "https://esm.sh/pdfjs-dist@4.5.136/build/pdf.worker.mjs";
  function b(n) {
    const { isOpen: i, onClose: o, onSave: l, theme: a } = n,
      [u, p] = e.useState(""),
      [d, c] = e.useState(""),
      [h, E] = e.useState(""),
      [x, C] = e.useState(""),
      [N, L] = e.useState("text"),
      [B, R] = e.useState(!1);
    if (!i) return null;
    const O = () => {
        p(""), c(""), E(""), C(""), R(!1);
      },
      _ = () => {
        O(), o();
      };
    return e.createElement(
      "div",
      {
        className:
          "fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center",
        onClick: _,
        "aria-modal": "true",
        role: "dialog",
      },
      e.createElement(
        "div",
        {
          className: `relative w-full max-w-2xl p-8 rounded-lg shadow-2xl ${
            a === "light" ? "bg-white" : "bg-dark-bg-panel"
          } ${a === "light" ? "text-light-text" : "text-dark-text"}`,
          onClick: (I) => I.stopPropagation(),
        },
        e.createElement(
          "button",
          {
            onClick: _,
            className:
              "absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700",
          },
          e.createElement(w, { name: "close" })
        ),
        e.createElement(
          "h2",
          { className: "text-2xl font-bold mb-6" },
          "Add a New Book"
        ),
        e.createElement(
          "div",
          { className: "border-b border-gray-200 dark:border-gray-700 mb-6" },
          e.createElement(
            "nav",
            {
              className: "-mb-px flex space-x-6",
              "aria-label": "Tabs",
            },
            e.createElement(
              "button",
              {
                onClick: () => L("text"),
                className: `whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  N === "text"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`,
              },
              "Paste Text"
            ),
            e.createElement(
              "button",
              {
                onClick: () => L("pdf"),
                className: `whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  N === "pdf"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`,
              },
              "Upload PDF"
            )
          )
        ),
        x &&
          e.createElement(
            "p",
            { className: "bg-red-100 text-red-700 p-3 rounded-md mb-4" },
            x
          ),
        e.createElement(
          "div",
          { className: "space-y-4" },
          e.createElement(
            "div",
            null,
            e.createElement(
              "label",
              { htmlFor: "title", className: "block text-sm font-medium mb-1" },
              "Title *"
            ),
            e.createElement("input", {
              type: "text",
              id: "title",
              value: u,
              onChange: (I) => p(I.target.value),
              className: `w-full p-2 border rounded-md ${
                a === "light" ? "bg-gray-100" : "bg-gray-800"
              } ${a === "light" ? "border-gray-300" : "border-gray-600"}`,
            })
          ),
          e.createElement(
            "div",
            null,
            e.createElement(
              "label",
              {
                htmlFor: "author",
                className: "block text-sm font-medium mb-1",
              },
              "Author"
            ),
            e.createElement("input", {
              type: "text",
              id: "author",
              value: d,
              onChange: (I) => c(I.target.value),
              className: `w-full p-2 border rounded-md ${
                a === "light" ? "bg-gray-100" : "bg-gray-800"
              } ${a === "light" ? "border-gray-300" : "border-gray-600"}`,
            })
          ),
          N === "text" &&
            e.createElement(
              "div",
              null,
              e.createElement(
                "label",
                {
                  htmlFor: "content",
                  className: "block text-sm font-medium mb-1",
                },
                "Book Content *"
              ),
              e.createElement("textarea", {
                id: "content",
                value: h,
                onChange: (I) => E(I.target.value),
                rows: 10,
                className: `w-full p-2 border rounded-md font-serif ${
                  a === "light" ? "bg-gray-100" : "bg-gray-800"
                } ${a === "light" ? "border-gray-300" : "border-gray-600"}`,
                placeholder:
                  "Paste the full content of your book here. The app will treat this as a single chapter.",
              })
            ),
          N === "pdf" &&
            e.createElement(
              "div",
              null,
              e.createElement(
                "label",
                {
                  htmlFor: "pdf-upload",
                  className: "block text-sm font-medium mb-1",
                },
                "PDF File *"
              ),
              e.createElement("input", {
                type: "file",
                id: "pdf-upload",
                accept: ".pdf",
                onChange: async (I) => {
                  const F = I.target.files == null ? void 0 : I.target.files[0];
                  if (F) {
                    R(!0), C(""), E(""), !u && F.name && p(F.name.replace(/\.pdf$/i, ""));
                    try {
                      const A = await F.arrayBuffer(),
                        P = await v.getDocument(A).promise;
                      let G = "";
                      for (let q = 1; q <= P.numPages; q++) {
                        const K = await P.getPage(q),
                          T = await K.getTextContent();
                        G +=
                          T.items
                            .map((M) => ("str" in M ? M.str : ""))
                            .join(" ") + "\n\n";
                      }
                      E(G.trim());
                    } catch (A) {
                      console.error("Failed to parse PDF:", A),
                        C(
                          "Could not parse the PDF file. It might be corrupted or protected."
                        );
                    } finally {
                      R(!1);
                    }
                  }
                },
                className: `w-full text-sm rounded-lg border cursor-pointer ${
                  a === "light" ? "bg-gray-100" : "bg-gray-800"
                } ${
                  a === "light" ? "border-gray-300" : "border-gray-600"
                } file:mr-4 file:py-2 file:px-4 file:rounded-l-md file:border-0 file:bg-gray-200 file:dark:bg-gray-700 hover:file:bg-gray-300 dark:hover:file:bg-gray-600`,
              }),
              B &&
                e.createElement(
                  "p",
                  { className: "text-primary mt-2 animate-pulse" },
                  "Parsing PDF, please wait..."
                ),
              h &&
                !B &&
                e.createElement(
                  "p",
                  { className: "text-green-600 mt-2" },
                  "✓ PDF content extracted successfully!"
                )
            )
        ),
        e.createElement(
          "div",
          { className: "mt-8 flex justify-end gap-4" },
          e.createElement(
            "button",
            {
              onClick: _,
              className:
                "py-2 px-4 rounded-md bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors",
            },
            "Cancel"
          ),
          e.createElement(
            "button",
            {
              onClick: () => {
                if (!u.trim() || !h.trim()) {
                  C("Title and Content are required.");
                  return;
                }
                const I = u.trim(),
                  F = I.toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(/[^a-z0-9-]/g, "");
                l({
                  id: `${F}-${k.v4()}`,
                  title: I,
                  author: d.trim() || "Unknown Author",
                  coverImage: s(I, F),
                  chapters: [{ title: "Chapter 1", content: h.trim() }],
                }),
                  _();
              },
              disabled: B,
              className:
                "py-2 px-4 rounded-md bg-primary text-white hover:bg-primary-focus transition-colors disabled:opacity-50 disabled:cursor-wait",
            },
            B ? "Parsing..." : "Save Book"
          )
        )
      )
    );
  }
  function L(n) {
    const {
        books: i,
        onSelectBook: o,
        onAddBook: l,
        onOpenCommandModal: a,
        onOpenSettings: u,
        theme: p,
      } = n,
      [d, c] = e.useState(!1);
    return e.createElement(
      e.Fragment,
      null,
      e.createElement(
        "div",
        { className: "container mx-auto px-4 py-12 relative" },
        e.createElement(
          "button",
          {
            onClick: u,
            className:
              "absolute top-12 right-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-10",
            "aria-label": "Settings",
          },
          e.createElement(w, { name: "key", className: "w-6 h-6" })
        ),
        e.createElement(
          "header",
          { className: "text-center mb-12" },
          e.createElement(
            "div",
            { className: "flex justify-center items-center gap-4 mb-4" },
            e.createElement(w, {
              name: "bookOpen",
              className: `w-12 h-12 ${
                p === "light" ? "text-primary" : "text-indigo-400"
              }`,
            }),
            e.createElement(
              "h1",
              { className: "text-5xl font-bold font-serif" },
              "AI Ebook Reader"
            )
          ),
          e.createElement(
            "p",
            {
              className: `text-xl ${
                p === "light" ? "text-gray-500" : "text-dark-text-muted"
              } mb-6`,
            },
            "Choose a book or use the AI to open one for you."
          ),
          e.createElement(
            "button",
            {
              onClick: () => c(!0),
              className:
                "bg-primary text-white font-bold py-2 px-6 rounded-full inline-flex items-center gap-2 hover:bg-primary-focus transition-colors shadow-md",
            },
            e.createElement(w, { name: "plus", className: "w-5 h-5" }),
            "Add Book"
          )
        ),
        e.createElement(
          "div",
          {
            className:
              "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8",
          },
          i.map((h) =>
            e.createElement(
              "div",
              {
                key: h.id,
                onClick: () => o(h),
                className: `group cursor-pointer transform hover:-translate-y-2 transition-transform duration-300 rounded-lg shadow-lg hover:shadow-2xl overflow-hidden ${
                  p === "light" ? "bg-white" : "bg-dark-bg-panel"
                }`,
              },
              e.createElement("img", {
                src: h.coverImage,
                alt: `Cover of ${h.title}`,
                className: "w-full h-auto object-cover aspect-[2/3]",
              }),
              e.createElement(
                "div",
                { className: "p-4" },
                e.createElement(
                  "h3",
                  {
                    className: `font-bold text-lg truncate ${
                      p === "light" ? "text-gray-800" : "text-dark-text"
                    }`,
                  },
                  h.title
                ),
                e.createElement(
                  "p",
                  {
                    className: `text-sm ${
                      p === "light" ? "text-gray-500" : "text-dark-text-muted"
                    }`,
                  },
                  h.author
                )
              )
            )
          )
        )
      ),
      e.createElement(
        "button",
        {
          onClick: a,
          className:
            "fixed bottom-8 right-8 bg-primary text-white rounded-full p-4 hover:bg-primary-focus transition-colors shadow-lg z-20",
          "aria-label": "Open AI Command Center",
        },
        e.createElement(w, { name: "microphone", className: "w-8 h-8" })
      ),
      e.createElement(b, {
        isOpen: d,
        onClose: () => c(!1),
        onSave: l,
        theme: p,
      })
    );
  }
  async function E(n, i, o) {
    const l = await fetch("https://api.elevenlabs.io/v1/text-to-speech/" + i, {
      method: "POST",
      headers: {
        Accept: "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": o,
      },
      body: JSON.stringify({
        text: n,
        model_id: "eleven_monolingual_v1",
        voice_settings: { stability: 0.5, similarity_boost: 0.5 },
      }),
    });
    if (!l.ok) {
      const a = await l.json();
      throw new Error(a.detail.message || "ElevenLabs API request failed");
    }
    return l.blob();
  }
  const x = (n, i) => {
    const [o, l] = e.useState(!1),
      [a, u] = e.useState(!1),
      [p, d] = e.useState(!1),
      [c, h] = e.useState(null),
      [E, x] = e.useState(-1),
      [C, N] = e.useState([]),
      L = e.useRef([]),
      B = e.useRef([]),
      R = e.useRef(null),
      _ = e.useRef(null),
      I = e.useRef(null),
      F = e.useRef(null),
      A = e.useRef(n);
    e.useEffect(() => {
      A.current = n;
    }, [n]);
    const P = e.useCallback(() => {
      const j = window.speechSynthesis.getVoices();
      j.length > 0 && N(j);
    }, []);
    e.useEffect(() => {
      (_.current = new Audio()), P();
      const j = _.current;
      return (
        window.speechSynthesis.onvoiceschanged !== void 0 &&
          (window.speechSynthesis.onvoiceschanged = P),
        j.addEventListener("ended", () => {
          l(!1),
            u(!1),
            x(-1),
            F.current ? (F.current(), (F.current = null)) : A.current();
        }),
        () => {
          window.speechSynthesis.cancel(),
            j.removeEventListener("ended", () => {
              l(!1),
                u(!1),
                x(-1),
                F.current ? (F.current(), (F.current = null)) : A.current();
            });
        }
      );
    }, [P]);
    const G = e.useCallback((j) => {
        if (j.provider === "browser") {
          const H =
            C.find(($) => $.voiceURI === j.voiceURI) ||
            C.find(($) => $.lang.startsWith("en") && $.name.includes("Google")) ||
            C.find(($) => $.lang.startsWith("en")) ||
            null;
          R.current = H;
        }
      }, [C]),
      q = e.useCallback(() => {
        if (B.current.length > 0) {
          const j = B.current.shift();
          j && (x((H) => H + 1), window.speechSynthesis.speak(j));
        } else
          l(!1),
            x(-1),
            F.current ? (F.current(), (F.current = null)) : A.current();
      }, []),
      K = e.useCallback(() => {
        (F.current = null),
          I.current === "browser"
            ? window.speechSynthesis.cancel()
            : _.current &&
              (_.current.pause(),
              (_.current.currentTime = 0),
              _.current.src.startsWith("blob:") &&
                URL.revokeObjectURL(_.current.src)),
          l(!1),
          u(!1),
          d(!1),
          x(-1),
          (B.current = []);
      }, []),
      T = e.useCallback(
        async (j, H, $) => {
          var J, z;
          if (
            (K(),
            h(null),
            (I.current = H.provider),
            (F.current = ($ == null ? void 0 : $.onPlaybackEnd) || null),
            H.provider === "browser")
          ) {
            const W =
                ((J = $ == null ? void 0 : $.splitSentences) != null
                  ? J
                  : !0)
                  ? j.match(/[^.!?]+[.!?]*/g) || [j]
                  : [j];
            (L.current = W),
              x(-1),
              (B.current = W.map((Q) => {
                const V = new SpeechSynthesisUtterance(Q.trim());
                return (
                  (V.voice = R.current),
                  (V.onend = () => q()),
                  (V.onerror = (ee) => {
                    console.error("SpeechSynthesisUtterance.onerror", ee),
                      h("A speech error occurred."),
                      q();
                  }),
                  V
                );
              })),
              l(!0),
              u(!1),
              q();
          } else if (H.provider === "elevenlabs")
            if (i && H.voiceId)
              try {
                d(!0);
                const W = await E(j, H.voiceId, i);
                if (_.current) {
                  const Q = URL.createObjectURL(W);
                  (_.current.src = Q),
                    _.current.play(),
                    l(!0),
                    u(!1),
                    (L.current = [j]),
                    x(0);
                }
              } catch (W) {
                console.error(W),
                  h(
                    (W == null ? void 0 : W.message) ||
                      "Failed to fetch audio from ElevenLabs."
                  );
              } finally {
                d(!1);
              }
            else h("ElevenLabs API key or Voice ID is missing.");
        },
        [i, q, K]
      ),
      M = e.useCallback(() => {
        I.current === "browser"
          ? window.speechSynthesis.pause()
          : _.current && _.current.pause(),
          u(!0),
          l(!1);
      }, []),
      U = e.useCallback(() => {
        I.current === "browser"
          ? window.speechSynthesis.resume()
          : _.current && _.current.play(),
          u(!1),
          l(!0);
      }, []);
    return {
      isPlaying: o,
      isPaused: a,
      isLoading: p,
      error: c,
      currentSentenceIndex: E,
      play: T,
      pause: M,
      resume: U,
      stop: K,
      setVoice: G,
      sentences: L.current,
    };
  };
  const C = e.forwardRef(function (n, i) {
    const {
        book: o,
        onExit: l,
        toggleTheme: a,
        onOpenCommandModal: u,
        onOpenSettings: p,
        theme: d,
        isOnline: c,
        elevenLabsKey: h,
        geminiKey: E,
        selectedVoice: C,
        onSetSelectedVoice: N,
      } = n,
      [L, B] = e.useState(0),
      [R, _] = e.useState(0),
      [I, F] = e.useState("text-lg"),
      [A, P] = e.useState(null),
      G = e.useRef(null),
      q = e.useCallback(() => {
        R < J.length - 1 && T("next", { keepPlaybackState: !0 });
      }, [R]),
      K = x(q, h),
      {
        isPlaying: T,
        isLoading: M,
        error: U,
        currentSentenceIndex: j,
        play: H,
        pause: $,
        resume: J,
        stop: z,
        setVoice: W,
        sentences: Q,
      } = K,
      V = e.useMemo(() => o.chapters[L], [o.chapters, L]),
      ee = A || U,
      Y = e.useMemo(() => {
        var Z;
        if (!((Z = V) != null && Z.content)) return [""];
        const D = V.content.replace(/\s+/g, " ").trim();
        if (!D) return [""];
        const X = 250 - y.FONT_SIZES.findIndex((ie) => ie.class === I) * 25,
          oe = D.split(" "),
          ae = [];
        for (let ie = 0; ie < oe.length; ie += X)
          ae.push(oe.slice(ie, ie + X).join(" "));
        return ae;
      }, [V, I]);
    e.useEffect(() => {
      !c &&
        C.provider === "elevenlabs" &&
        N(y.AI_VOICES.find((D) => D.provider === "browser") || y.AI_VOICES[0]);
    }, [c, C, N]),
      e.useEffect(() => {
        W(C);
      }, [C, W]),
      e.useEffect(() => {
        B(0), _(0), z(), P(null);
      }, [o, z]);
    const le = (Z, D) => {
        (D != null && D.keepPlaybackState) || z(),
          _((X) =>
            Z === "next" && X < Y.length - 1
              ? X + 1
              : Z === "previous" && X > 0
              ? X - 1
              : X
          );
      },
      fe = (Z) =>
        Z >= 0 && Z < o.chapters.length ? (z(), B(Z), _(0), !0) : !1,
      de = (Z) => (
        P(null),
        C.provider === "elevenlabs" &&
          (!c
            ? (P("ElevenLabs voices are unavailable offline."), !1)
            : h
            ? void 0
            : (P("ElevenLabs API key is missing. Please add it in settings."),
              p(),
              !1)),
        H(Y[R], C, { onPlaybackEnd: Z }),
        !0
      );
    e.useImperativeHandle(i, () => ({
      read: () => de(),
      pause: $,
      resume: J,
      navigatePage: (Z) => le(Z),
      setChapter: (Z) => fe(Z),
      getCurrentPage: () => R,
      getCurrentChapterIndex: () => L,
    }));
    const se = e.useMemo(
        () => ({
          bg: d === "light" ? "bg-light-bg" : "bg-dark-bg",
          text: d === "light" ? "text-light-text" : "text-dark-text",
          panelBg: d === "light" ? "bg-white" : "bg-dark-bg-panel",
          button: `rounded-full p-2 transition-colors ${
            d === "light" ? "hover:bg-gray-200" : "hover:bg-gray-600"
          }`,
          highlight: d === "light" ? "bg-highlight" : "bg-dark-highlight",
        }),
        [d]
      ),
      pe = e.useCallback(() => {
        if (!Y || Y.length === 0 || !Y[R])
          return e.createElement(
            "p",
            { className: "text-center italic" },
            "This chapter is empty."
          );
        if (!T && !M) return e.createElement("p", null, Y[R]);
        const Z = C.provider === "elevenlabs" && T ? se.highlight : "";
        return e.createElement(
          "p",
          { className: Z },
          Q.map((D, X) =>
            e.createElement(
              "span",
              {
                key: X,
                className: `${
                  X === j && C.provider === "browser" ? se.highlight : ""
                }`,
              },
              D
            )
          )
        );
      }, [Y, R, T, Q, j, se.highlight, C.provider, M]);
    return e.createElement(
      e.Fragment,
      null,
      e.createElement(
        "div",
        {
          className: `flex h-screen overflow-hidden ${se.bg} ${se.text}`,
        },
        e.createElement(
          "div",
          {
            className:
              "flex-grow flex flex-col transition-all duration-300",
          },
          e.createElement(
            "header",
            {
              className: `${se.panelBg} shadow-md p-4 flex justify-between items-center z-10`,
            },
            e.createElement(
              "div",
              { className: "flex items-center gap-2 sm:gap-4" },
              e.createElement(
                "button",
                { onClick: l, className: se.button },
                e.createElement(w, { name: "bookOpen" })
              ),
              e.createElement(
                "div",
                { className: "min-w-0" },
                e.createElement(
                  "h1",
                  { className: "text-lg sm:text-xl font-bold truncate" },
                  o.title
                ),
                e.createElement(
                  "h2",
                  { className: "text-sm opacity-70 truncate" },
                  (V == null ? void 0 : V.title) || "No Chapters"
                )
              )
            ),
            e.createElement(
              "div",
              { className: "flex items-center gap-2 sm:gap-4" },
              e.createElement(
                "button",
                { onClick: a, className: se.button },
                e.createElement(w, {
                  name: d === "light" ? "moon" : "sun",
                })
              ),
              e.createElement(
                "button",
                { onClick: p, className: se.button },
                e.createElement(w, { name: "key" })
              )
            )
          ),
          e.createElement(
            "div",
            {
              ref: G,
              className:
                "flex-grow p-4 sm:p-8 md:p-12 lg:p-16 overflow-y-auto relative",
            },
            e.createElement(
              "div",
              { className: `font-serif leading-relaxed ${I} ` },
              e.createElement(pe, null),
              M &&
                e.createElement(
                  "div",
                  {
                    className:
                      "absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center",
                  },
                  e.createElement("p", null, "Generating audio...")
                ),
              ee &&
                e.createElement(
                  "div",
                  { className: "mt-4 text-red-500 text-center" },
                  e.createElement("p", null, ee)
                )
            )
          ),
          e.createElement(
            "footer",
            {
              className: `${se.panelBg} shadow-inner p-2 sm:p-4 flex flex-col sm:flex-row justify-between items-center z-10 gap-2`,
            },
            e.createElement(
              "div",
              { className: "w-full sm:w-1/3 flex justify-start" },
              e.createElement(
                "select",
                {
                  value: L,
                  onChange: (Z) => fe(parseInt(Z.target.value)),
                  className: `border rounded p-2 text-sm w-full sm:w-auto ${
                    d === "light"
                      ? "bg-gray-50"
                      : "bg-gray-700 border-gray-600"
                  }`,
                },
                o.chapters.map((Z, D) =>
                  e.createElement("option", { key: D, value: D }, Z.title)
                ),
                o.chapters.length === 0 &&
                  e.createElement("option", null, "No Chapters")
              )
            ),
            e.createElement(
              "div",
              {
                className:
                  "w-full sm:w-auto flex items-center justify-center gap-4",
              },
              e.createElement(
                "button",
                {
                  onClick: () => le("previous"),
                  className: se.button,
                  disabled: R === 0,
                },
                e.createElement(w, {
                  name: "chevronLeft",
                  className: "w-7 h-7",
                })
              ),
              e.createElement(
                "button",
                {
                  onClick: u,
                  disabled: !c || !E,
                  className:
                    "bg-primary text-white rounded-full p-4 hover:bg-primary-focus transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400",
                },
                e.createElement(w, {
                  name: "microphone",
                  className: "w-8 h-8",
                })
              ),
              e.createElement(
                "button",
                {
                  onClick: () => le("next"),
                  className: se.button,
                  disabled: R >= Y.length - 1,
                },
                e.createElement(w, {
                  name: "chevronRight",
                  className: "w-7 h-7",
                })
              )
            ),
            e.createElement(
              "div",
              {
                className:
                  "w-full sm:w-1/3 flex items-center justify-end gap-2",
              },
              e.createElement(
                "span",
                { className: "text-sm opacity-70 hidden md:inline" },
                "Page ",
                Y.length > 0 ? R + 1 : 0,
                "/",
                Y.length
              ),
              e.createElement(
                "select",
                {
                  value: C.id,
                  onChange: (Z) =>
                    N(
                      y.AI_VOICES.find((D) => D.id === Z.target.value) ||
                        y.AI_VOICES[0]
                    ),
                  className: `border rounded p-2 text-sm w-full sm:w-auto ${
                    d === "light"
                      ? "bg-gray-50"
                      : "bg-gray-700 border-gray-600"
                  }`,
                },
                y.AI_VOICES.map((Z) =>
                  e.createElement(
                    "option",
                    {
                      key: Z.id,
                      value: Z.id,
                      disabled: Z.provider === "elevenlabs" && !c,
                    },
                    Z.name,
                    " ",
                    Z.provider === "elevenlabs" && !c ? "(Offline)" : ""
                  )
                )
              )
            )
          )
        )
      )
    );
  });
  const ue = (n) => {
    const { onResult: i, onError: o, onEnd: l } = n,
      [a, u] = e.useState(!1),
      [p, d] = e.useState(!1),
      c = e.useRef(null);
    e.useEffect(
      () => (
        (window.SpeechRecognition || window.webkitSpeechRecognition
          ? (d(!0),
            (c.current = new (
              window.SpeechRecognition || window.webkitSpeechRecognition
            )()),
            (c.current.continuous = !0),
            (c.current.interimResults = !0),
            (c.current.lang = "en-US"))
          : (d(!1),
            console.warn(
              "Speech Recognition API is not supported in this browser."
            )),
        () => {
          c.current && c.current.stop();
        }
      ),
      []
    );
    const h = e.useCallback(
        (C) => {
          let N = "";
          for (let L = C.resultIndex; L < C.results.length; ++L)
            C.results[L].isFinal && (N += C.results[L][0].transcript);
          N && i(N);
        },
        [i]
      ),
      E = e.useCallback(
        (C) => {
          C.error === "not-allowed" || C.error === "service-not-allowed"
            ? o(
                "Microphone access was denied. Please enable it in your browser settings."
              )
            : o(`Speech recognition error: ${C.error}`),
            u(!1),
            l && l();
        },
        [o, l]
      ),
      x = e.useCallback(() => {
        u(!1), l && l();
      }, [l]);
    return {
      isListening: a,
      isSupported: p,
      startListening: e.useCallback(() => {
        if (a || !c.current) return;
        try {
          (c.current.onresult = h),
            (c.current.onerror = E),
            (c.current.onend = x),
            c.current.start(),
            u(!0);
        } catch (C) {
          o(`Could not start recognition: ${C.message}`);
        }
      }, [a, h, E, x]),
      stopListening: e.useCallback(() => {
        !a ||
          !c.current ||
          (c.current.stop(),
          u(!1));
      }, [a]),
    };
  };
  function N(n) {
    const {
        isOpen: i,
        onClose: o,
        theme: l,
        isOnline: a,
        geminiKey: u,
        elevenLabsKey: p,
        onOpenSettings: d,
        onProcessCommand: c,
        selectedVoice: h,
      } = n,
      [E, x] = e.useState([]),
      [C, N] = e.useState("idle"),
      [L, B] = e.useState(null),
      R = e.useRef(null),
      _ = e.useCallback(
        async (J) => {
          if (!J) {
            N("idle");
            return;
          }
          N("processing"), F();
          const z = {
            role: "user",
            content: J,
            timestamp: new Date().toISOString(),
          };
          x((Q) => [...Q, z]);
          const W = await c(J);
          if (W.action === "CONVERSE" || W.action === "UNKNOWN") {
            const Q =
              W.payload.response || "I am not sure how to respond to that.";
            x((ee) => [
              ...ee,
              { role: "model", content: Q, timestamp: new Date().toISOString() },
            ]),
              N("speaking"),
              A.play(Q, h, {
                splitSentences: !1,
                onPlaybackEnd: () => {
                  setTimeout(() => I(), 100);
                },
              });
          } else
            x((Q) => [
              ...Q,
              {
                role: "command",
                content: `Command executed: ${W.action}`,
                timestamp: new Date().toISOString(),
              },
            ]),
              W.action !== "PAUSE" &&
                W.action !== "RESUME" &&
                W.action !== "READ" &&
                setTimeout(() => o(), 1e3),
              N("idle");
        },
        [c, h, o]
      ),
      {
        isListening: I,
        isSupported: F,
        startListening: A,
        stopListening: P,
      } = ue({
        onResult: _,
        onError: (J) => {
          B(J), N("idle");
        },
        onEnd: () => {
          C === "listening" && N("idle");
        },
      }),
      G = x(() => {
        C === "speaking" && N("idle");
      }, p);
    e.useEffect(() => {
      G.setVoice(h);
    }, [h, G]);
    const q = {
      bg: l === "light" ? "bg-white" : "bg-dark-bg-panel",
      text: l === "light" ? "text-gray-800" : "text-dark-text",
      userBubble: "bg-primary text-white",
      modelBubble:
        l === "light" ? "bg-gray-200 text-gray-800" : "bg-gray-700 text-dark-text",
      commandBubble:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    };
    e.useEffect(() => {
      var J;
      (J = R.current) == null || J.scrollIntoView({ behavior: "smooth" });
    }, [E]),
      e.useEffect(() => {
        i ? (B(null), x([]), T()) : (I && P(), G.stop(), N("idle"));
      }, [i]),
      e.useEffect(() => {
        I && C !== "listening" && N("listening");
      }, [I, C]);
    const K = () => {
      B(null),
        a
          ? u
            ? (C === "speaking" ? (G.stop(), N("idle")) : I ? (P(), N("idle")) : A())
            : (o(), d())
          : B("Voice commands are unavailable offline.");
    };
    if (!i) return null;
    let T = "Tap the mic to issue a command or speak.",
      M = e.createElement(w, { name: "microphone", className: "w-10 h-10" }),
      U = "bg-primary text-white hover:bg-primary-focus";
    switch (C) {
      case "listening":
        (T = "Listening..."),
          (U = "bg-red-500 text-white scale-110 animate-pulse");
        break;
      case "processing":
        (T = "Thinking..."),
          (M = e.createElement("div", {
            className:
              "w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin",
          })),
          (U = "bg-primary text-white");
        break;
      case "speaking":
        (T = "Speaking... (Tap to interrupt)"),
          (M = e.createElement(w, { name: "pause", className: "w-10 h-10" })),
          (U = "bg-secondary text-white");
        break;
    }
    return e.createElement(
      "div",
      {
        className:
          "fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center backdrop-blur-sm",
        onClick: o,
      },
      e.createElement(
        "div",
        {
          className: `w-full max-w-2xl h-[80vh] flex flex-col rounded-xl shadow-2xl overflow-hidden ${q.bg} ${q.text}`,
          onClick: (J) => J.stopPropagation(),
        },
        e.createElement(
          "header",
          {
            className:
              "flex items-center justify-between p-4 shadow-md shrink-0",
          },
          e.createElement(
            "h3",
            { className: "font-bold text-lg" },
            "AI Command Center"
          ),
          e.createElement(
            "button",
            {
              onClick: o,
              className:
                "p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700",
            },
            e.createElement(w, { name: "close" })
          )
        ),
        e.createElement(
          "div",
          { className: "flex-grow p-4 overflow-y-auto" },
          e.createElement(
            "div",
            { className: "flex flex-col gap-4" },
            E.length === 0 &&
              e.createElement(
                "div",
                { className: "text-center text-gray-500 italic mt-8" },
                F ? "Press the mic to start." : "Speech recognition not supported."
              ),
            E.map((J, z) =>
              e.createElement(
                "div",
                {
                  key: z,
                  className: `flex items-start gap-3 ${
                    J.role === "user" ? "justify-end" : "justify-start"
                  }`,
                },
                J.role === "user" &&
                  e.createElement(
                    "div",
                    {
                      className: `max-w-xs md:max-w-md rounded-lg p-3 ${q.userBubble}`,
                    },
                    e.createElement(
                      "p",
                      { className: "whitespace-pre-wrap" },
                      J.content
                    )
                  ),
                J.role === "model" &&
                  e.createElement(
                    "div",
                    { className: "flex items-start gap-3" },
                    e.createElement(
                      "div",
                      {
                        className:
                          "w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 mt-1",
                      },
                      "AI"
                    ),
                    e.createElement(
                      "div",
                      {
                        className: `max-w-xs md:max-w-md rounded-lg p-3 ${q.modelBubble}`,
                      },
                      e.createElement(
                        "p",
                        { className: "whitespace-pre-wrap" },
                        J.content
                      )
                    )
                  ),
                J.role === "command" &&
                  e.createElement(
                    "div",
                    {
                      className: `w-full text-center text-xs italic p-2 rounded-md ${q.commandBubble}`,
                    },
                    J.content
                  )
              )
            ),
            e.createElement("div", { ref: R })
          )
        ),
        e.createElement(
          "div",
          {
            className:
              "p-6 shrink-0 border-t dark:border-gray-700 flex flex-col items-center justify-center",
          },
          e.createElement(
            "button",
            {
              onClick: K,
              disabled: !F || !a,
              className: `w-20 h-20 rounded-full transition-all duration-300 flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${U}`,
            },
            M
          ),
          e.createElement(
            "p",
            { className: "mt-4 text-sm text-gray-500 dark:text-gray-400 h-5" },
            L || T
          )
        )
      )
    );
  }
  function B(n) {
    const {
        isOpen: i,
        onClose: o,
        onSave: l,
        theme: a,
        currentElevenLabsKey: u,
        currentGeminiKey: p,
      } = n,
      [d, c] = e.useState({ elevenLabs: u, gemini: p });
    if (
      (e.useEffect(() => {
        c({ elevenLabs: u, gemini: p });
      }, [u, p, i]),
      !i)
    )
      return null;
    const h = () => {
      l(d);
    };
    return e.createElement(
      "div",
      {
        className:
          "fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center",
        onClick: o,
        "aria-modal": "true",
        role: "dialog",
      },
      e.createElement(
        "div",
        {
          className: `relative w-full max-w-md p-8 rounded-lg shadow-2xl ${
            a === "light" ? "bg-white" : "bg-dark-bg-panel"
          } ${a === "light" ? "text-light-text" : "text-dark-text"}`,
          onClick: (x) => x.stopPropagation(),
        },
        e.createElement(
          "button",
          {
            onClick: o,
            className:
              "absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700",
          },
          e.createElement(w, { name: "close" })
        ),
        e.createElement(
          "h2",
          { className: "text-2xl font-bold mb-4" },
          "API Key Settings"
        ),
        e.createElement(
          "div",
          { className: "space-y-6" },
          e.createElement(
            "div",
            null,
            e.createElement(
              "label",
              {
                htmlFor: "elevenLabs",
                className: "block text-sm font-medium mb-1",
              },
              "ElevenLabs API Key"
            ),
            e.createElement("input", {
              type: "password",
              id: "elevenLabs",
              name: "elevenLabs",
              value: d.elevenLabs,
              onChange: (x) => {
                const { name: C, value: N } = x.target;
                c((L) => ({ ...L, [C]: N }));
              },
              className: `w-full p-2 border rounded-md ${
                a === "light" ? "bg-gray-100" : "bg-gray-800"
              } ${a === "light" ? "border-gray-300" : "border-gray-600"}`,
              placeholder: "For premium voices",
            }),
            e.createElement(
              "p",
              { className: "text-xs text-gray-500 dark:text-gray-400 mt-1" },
              "Your key is stored only in your browser. Get one from the ",
              e.createElement(
                "a",
                {
                  href: "https://elevenlabs.io/",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-primary underline",
                },
                "ElevenLabs website"
              ),
              "."
            )
          ),
          e.createElement(
            "div",
            null,
            e.createElement(
              "label",
              {
                htmlFor: "gemini",
                className: "block text-sm font-medium mb-1",
              },
              "Google AI API Key"
            ),
            e.createElement("input", {
              type: "password",
              id: "gemini",
              name: "gemini",
              value: d.gemini,
              onChange: (x) => {
                const { name: C, value: N } = x.target;
                c((L) => ({ ...L, [C]: N }));
              },
              className: `w-full p-2 border rounded-md ${
                a === "light" ? "bg-gray-100" : "bg-gray-800"
              } ${a === "light" ? "border-gray-300" : "border-gray-600"}`,
              placeholder: "For AI chat conversations",
            }),
            e.createElement(
              "p",
              { className: "text-xs text-gray-500 dark:text-gray-400 mt-1" },
              "Your key is stored only in your browser. Get one from ",
              e.createElement(
                "a",
                {
                  href: "https://aistudio.google.com/app/apikey",
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-primary underline",
                },
                "Google AI Studio"
              ),
              "."
            )
          )
        ),
        e.createElement(
          "div",
          { className: "mt-8 flex justify-end gap-4" },
          e.createElement(
            "button",
            {
              onClick: o,
              className:
                "py-2 px-4 rounded-md bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors",
            },
            "Cancel"
          ),
          e.createElement(
            "button",
            {
              onClick: h,
              className:
                "py-2 px-4 rounded-md bg-primary text-white hover:bg-primary-focus transition-colors",
            },
            "Save Keys"
          )
        )
      )
    );
  }
  function R() {
    var j;
    const [i, o] = e.useState(null),
      [l, a] = e.useState(
        () => localStorage.getItem("ebook-theme") || "light"
      ),
      [u, p] = e.useState(() => {
        const H = localStorage.getItem("custom-books");
        return [...g, ...(H ? JSON.parse(H) : [])];
      }),
      [d, c] = e.useState(() => navigator.onLine),
      [h, E] = e.useState(!1),
      [x, C] = e.useState(!1),
      [N, L] = e.useState(() => localStorage.getItem("gemini-api-key") || ""),
      [O, _] = e.useState(
        () => localStorage.getItem("elevenlabs-api-key") || ""
      ),
      [I, F] = e.useState(y.AI_VOICES[0]),
      A = e.useRef(null);
    e.useEffect(() => {
      localStorage.setItem("ebook-theme", l),
        document.documentElement.classList.toggle("dark", l === "dark");
    }, [l]),
      e.useEffect(() => {
        const H = () => c(!0),
          $ = () => c(!1);
        return (
          window.addEventListener("online", H),
          window.addEventListener("offline", $),
          () => {
            window.removeEventListener("online", H),
              window.removeEventListener("offline", $);
          }
        );
      }, []);
    const P = (H) => {
        p(($) => {
          const J = [...$, H];
          return (
            localStorage.setItem(
              "custom-books",
              JSON.stringify(J.filter((z) => !g.some((W) => W.id === z.id)))
            ),
            J
          );
        }),
          o(H);
      },
      G = (H) => {
        const $ = u.find((J) => J.title.toLowerCase().includes(H.toLowerCase()));
        return $ ? (o($), E(!1), !0) : !1;
      },
      q = (H) => {
        L(H.elevenLabs),
          localStorage.setItem("elevenlabs-api-key", H.elevenLabs),
          _(H.gemini),
          localStorage.setItem("gemini-api-key", H.gemini),
          C(!1);
      },
      K = async (H) => {
        var $, J, z, W, Q, V, ee, Y;
        const D = {
            currentBook: i,
            currentChapterIndex:
              (J = ($ = A.current) == null ? void 0 : $.getCurrentChapterIndex()) !=
              null
                ? J
                : 0,
            currentPage:
              (W = (z = A.current) == null ? void 0 : z.getCurrentPage()) != null
                ? W
                : 0,
            library: u,
          },
          X = await S.processCommand(H, D, N),
          oe = A.current;
        if (i && oe)
          switch (X.action) {
            case "READ":
              oe.read();
              break;
            case "PAUSE":
              oe.pause();
              break;
            case "RESUME":
              oe.resume();
              break;
            case "NAVIGATE_PAGE":
              X.payload.pageDirection &&
                oe.navigatePage(X.payload.pageDirection);
              break;
            case "NAVIGATE_CHAPTER":
              X.payload.chapterIndex !== void 0 &&
                oe.setChapter(X.payload.chapterIndex);
              break;
          }
        return (
          X.action === "SWITCH_BOOK" && X.payload.bookTitle && G(X.payload.bookTitle),
          X
        );
      };
    return e.createElement(
      e.Fragment,
      null,
      e.createElement(
        "main",
        {
          className: `min-h-screen font-sans transition-colors duration-300 ${
            l === "light"
              ? "bg-light-bg text-light-text"
              : "bg-dark-bg text-dark-text"
          }`,
        },
        i
          ? e.createElement(C, {
              ref: A,
              book: i,
              theme: l,
              isOnline: d,
              elevenLabsKey: O,
              geminiKey: N,
              onExit: () => {
                o(null);
              },
              toggleTheme: () => {
                a((H) => (H === "light" ? "dark" : "light"));
              },
              onOpenCommandModal: () => E(!0),
              onOpenSettings: () => C(!0),
              selectedVoice: I,
              onSetSelectedVoice: F,
            })
          : e.createElement(L, {
              books: u,
              onSelectBook: (H) => {
                o(H);
              },
              onAddBook: P,
              theme: l,
              onOpenCommandModal: () => E(!0),
              onOpenSettings: () => C(!0),
            })
      ),
      e.createElement(N, {
        isOpen: h,
        onClose: () => E(!1),
        theme: l,
        isOnline: d,
        geminiKey: N,
        elevenLabsKey: O,
        onOpenSettings: () => C(!0),
        onProcessCommand: K,
        selectedVoice: I,
      }),
      e.createElement(B, {
        isOpen: x,
        onClose: () => C(!1),
        onSave: q,
        theme: l,
        currentElevenLabsKey: O,
        currentGeminiKey: N,
      })
    );
  }
  const D = document.getElementById("root");
  if (!D) throw new Error("Could not find root element to mount to");
  const X = t.createRoot(D);
  X.render(e.createElement(e.StrictMode, null, e.createElement(R, null))),
    "serviceWorker" in navigator &&
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("sw.js")
          .then((i) => {
            console.log(
              "ServiceWorker registration successful with scope: ",
              i.scope
            );
          })
          .catch((i) => {
            console.log("ServiceWorker registration failed: ", i);
          });
      });
})();
//# sourceMappingURL=index.js.map
