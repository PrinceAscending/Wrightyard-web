const channelGroups = [
  {
    mark: "⌗",
    name: "Gate",
    channels: ["welcome", "rules", "roles"],
  },
  {
    mark: "❀",
    name: "Main deck",
    channels: ["general", "introductions"],
  },
  {
    mark: "⌁",
    name: "Workshop",
    channels: ["code-help", "showcase"],
  },
  {
    mark: "✦",
    name: "Front desk",
    channels: ["services", "pricing"],
  },
  {
    mark: "♡",
    name: "After hours",
    channels: ["music", "gaming"],
  },
];

const roles = [
  { name: "Builder", note: "ships things", tone: "red" },
  { name: "Listener", note: "here for the sound", tone: "blue" },
  { name: "Player", note: "here for the game", tone: "brass" },
  { name: "Crew", note: "part of the yard", tone: "ink" },
  { name: "No-Ping", note: "quiet mode", tone: "paper" },
];

export default function Specimen() {
  return (
    <div className="specimen" aria-label="A specimen of the Wrightyard HQ Discord server">
      <div className="specimen__bar">
        <span>Specimen 001</span>
        <span className="specimen__bar-title">Wrightyard HQ / Discord</span>
        <span className="specimen__live">
          <span className="status-dot" aria-hidden="true" />
          Live
        </span>
      </div>

      <div className="specimen__body">
        <div className="specimen__panel specimen__panel--index">
          <p className="specimen__label">The yard</p>
          <ul className="channel-index">
            {channelGroups.map((group) => (
              <li key={group.name}>
                <p className="channel-index__cat">
                  <span aria-hidden="true">{group.mark}</span>
                  {group.name}
                </p>
                <ul>
                  {group.channels.map((channel) => (
                    <li key={channel}>
                      <span className="channel-index__hash" aria-hidden="true">
                        #
                      </span>
                      {channel}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>

        <div className="specimen__panel specimen__panel--gate">
          <p className="specimen__label">The gate</p>
          <div className="onboarding-card">
            <p className="onboarding-card__step">Step 1 of 3</p>
            <h3>Which gate are you walking through?</h3>
            <ul className="gate-options">
              <li className="is-selected">
                <span className="gate-radio" aria-hidden="true" />
                I build things
              </li>
              <li>
                <span className="gate-radio" aria-hidden="true" />
                I&apos;m hiring
              </li>
              <li>
                <span className="gate-radio" aria-hidden="true" />
                Music first
              </li>
              <li>
                <span className="gate-radio" aria-hidden="true" />
                Here to play
              </li>
            </ul>
            <div className="onboarding-card__foot">
              <span>3 prompts</span>
              <span>9 channels</span>
              <span>1 bot</span>
            </div>
          </div>
        </div>

        <div className="specimen__panel specimen__panel--crew">
          <p className="specimen__label">The crew</p>
          <ul className="role-list">
            {roles.map((role) => (
              <li key={role.name}>
                <span className={`role-chip role-chip--${role.tone}`} aria-hidden="true" />
                <span className="role-list__name">{role.name}</span>
                <span className="role-list__note">{role.note}</span>
              </li>
            ))}
          </ul>
          <p className="specimen__note">
            Crew is automatic on entry. The rest arrive through native
            onboarding, and the level ladder is earned in the yard. No reaction
            roles, no extra bot required.
          </p>
        </div>
      </div>
    </div>
  );
}
