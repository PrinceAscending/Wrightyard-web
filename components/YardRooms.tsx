"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const rooms = [
  {
    mark: "⌁",
    name: "Workshop",
    channel: "workshop",
    topic: "build logs, code help, and the occasional fire",
    online: 12,
    messages: [
      { author: "Ada", tone: "red", time: "09:41", text: "Deploy is green. 42 seconds, no warnings." },
      { author: "Miles", tone: "blue", time: "09:42", text: "Ticket patch is up. Review when you can." },
      { author: "Wren", tone: "brass", time: "09:43", text: "The bot is quiet. That is the compliment." },
    ],
  },
  {
    mark: "✦",
    name: "Front Desk",
    channel: "front-desk",
    topic: "quotes, scopes, and client work",
    online: 4,
    messages: [
      { author: "June", tone: "brass", time: "11:02", text: "Quote request: ticket bot, docs, handoff." },
      { author: "Ada", tone: "red", time: "11:04", text: "Scope is written. Sending it over." },
      { author: "Sol", tone: "blue", time: "11:06", text: "Fixed price, fixed date. Nice." },
    ],
  },
  {
    mark: "❀",
    name: "Main Deck",
    channel: "general",
    topic: "introductions and the daily roll call",
    online: 28,
    messages: [
      { author: "Nia", tone: "blue", time: "08:12", text: "New here. I build Discord tools and break them gently." },
      { author: "Theo", tone: "brass", time: "08:14", text: "Welcome in. The workshop is that way." },
      { author: "June", tone: "red", time: "08:15", text: "Mind the coffee machine." },
    ],
  },
  {
    mark: "♡",
    name: "Rec Room",
    channel: "games",
    topic: "lobbies, bad takes, and one more round",
    online: 16,
    messages: [
      { author: "Theo", tone: "brass", time: "20:01", text: "Game night at 21:00 UTC. Bring a controller." },
      { author: "Nia", tone: "blue", time: "20:02", text: "I will bring the bad takes." },
      { author: "Miles", tone: "red", time: "20:03", text: "One more round is a trap and I am in." },
    ],
  },
  {
    mark: "♫",
    name: "Radio Room",
    channel: "music",
    topic: "streams, clips, and things with too much reverb",
    online: 9,
    messages: [
      { author: "Wren", tone: "brass", time: "22:18", text: "Now playing: something with too much reverb." },
      { author: "Sol", tone: "blue", time: "22:19", text: "Correct amount of reverb." },
      { author: "Ada", tone: "red", time: "22:21", text: "Queue is open." },
    ],
  },
  {
    mark: "⊹",
    name: "Break Room",
    channel: "off-topic",
    topic: "after hours, off topic, and the coffee ledger",
    online: 7,
    messages: [
      { author: "June", tone: "red", time: "01:12", text: "Coffee machine status: critical." },
      { author: "Theo", tone: "brass", time: "01:13", text: "Logged in the ledger." },
      { author: "Wren", tone: "blue", time: "01:14", text: "Someone ship a fix." },
    ],
  },
];

export default function YardRooms() {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const room = rooms[active];

  return (
    <div className="yard-console">
      <div className="yard-console__tabs" role="group" aria-label="Rooms in the yard">
        {rooms.map((item, index) => (
          <button
            type="button"
            key={item.name}
            aria-pressed={active === index}
            onClick={() => setActive(index)}
          >
            <span aria-hidden="true">{item.mark}</span>
            {item.name}
          </button>
        ))}
      </div>

      <p className="sr-only" role="status">
        {room.name} selected
      </p>

      <div className="yard-window">
        <div className="yard-window__bar">
          <span># {room.channel}</span>
          <span className="yard-window__online">
            <span className="live-dot is-live" aria-hidden="true" />
            {room.online} in the room
          </span>
        </div>
        <p className="yard-window__topic">{room.topic}</p>

        <AnimatePresence mode="wait" initial={false}>
          <motion.ul
            key={room.channel}
            className="yard-window__messages"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            {room.messages.map((message) => (
              <li className="yard-msg" key={`${room.channel}-${message.time}`}>
                <span
                  className={`yard-msg__avatar yard-msg__avatar--${message.tone}`}
                  aria-hidden="true"
                >
                  {message.author.slice(0, 1)}
                </span>
                <span className="yard-msg__body">
                  <span className="yard-msg__head">
                    <span className={`yard-msg__author yard-msg__author--${message.tone}`}>
                      {message.author}
                    </span>
                    <span className="yard-msg__time">{message.time}</span>
                  </span>
                  <span className="yard-msg__text">{message.text}</span>
                </span>
              </li>
            ))}
          </motion.ul>
        </AnimatePresence>

        <div className="yard-window__typing">
          <span className="typing-dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          someone is typing
        </div>

        <div className="yard-console__foot">
          <span>Wrightyard HQ</span>
          <span>Preview / not live</span>
        </div>
      </div>
    </div>
  );
}
