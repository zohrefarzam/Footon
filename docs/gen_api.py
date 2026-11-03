"""Generate docs/api.html (Footon API handover) from structured data."""
import html, json, re, sys

OUT = sys.argv[1]
E = html.escape

def F(name, typ, req=True, notes=""):
    return (name, typ, req, notes)

def R(name, typ, notes=""):
    return (name, typ, notes)

# ------------------------------------------------------------------ types
TYPES = [
  ("UserRef", "A person, as every list and avatar shows them.", [
    F("id","string"), F("name","string",notes="“Sara”"), F("initial","string",notes="Avatar fallback, “S”"),
    F("avatarUrl","string",False), F("you","boolean",False,"True for the caller. The UI colours it lime.")]),
  ("Team", "A club. Colours drive the placeholder crest and the lineup discs.", [
    F("id","string"), F("code","string",notes="3 letters, “LIV”. Shown instead of the name under 360px."),
    F("name","string",notes="“Liverpool”"), F("colors","[string, string]",False,"[shirt, trim] hex"),
    F("crestUrl","string",False,"Once crests are licensed")]),
  ("Competition", "Group header on the Live tab: “ENG · England · Premier League”.", [
    F("id","string"), F("name","string"), F("country","string"), F("countryCode","string",notes="“ENG”")]),
  ("MatchSummary", "What every match row needs (Home, Live tab, challenge rows).", [
    F("id","string"), F("competition","Competition"), F("home","Team"), F("away","Team"),
    F("status","MatchStatus"), F("kickoffAt","ISO datetime",notes="Always present. The client formats it."),
    F("minute","int",False,"Live only"), F("addedTime","int",False,"Live only, shows as 45+2'"),
    F("period","Period",False), F("score","[int, int]",False,"Live and finished"),
    F("redCards","[int, int]",False,"Glyph next to the team"),
    F("boost","2",False,"Big match: right predictions pay 2x coins (never points)"),
    F("you","MatchYou",False,"When the caller has calls or predictions on it"),
    F("league","{ challengeId, name }",False,"Your joined challenge on this match")]),
  ("MatchYou", "Your part in one match.", [
    F("calls","int"), F("right","int"), F("points","int",notes="Points earned on this match"),
    F("streak","int",notes="Right calls in a row now. Flame at 3 or more."),
    F("predictions","int",False,"Locked predictions on your slip")]),
  ("MatchDetail", "MatchSummary plus the sections of the match page. Every section is optional: if it's absent, the UI hides that tab.", [
    F("…","MatchSummary",notes="All summary fields"),
    F("events","MatchEvent[]",False), F("stats","MatchStat[]",False),
    F("lineups","{ home: Lineup, away: Lineup }",False), F("table","TableRow[]",False,"Rows around both teams"),
    F("h2h","{ won, drawn, lost }",False,"From the home side's view"),
    F("preview","MatchPreview",False,"Upcoming only"), F("crowd","CrowdPoll",False),
    F("question","LiveQuestion",False,"Live only: the open or last system question"),
    F("progress","{ asked, total }",False,"“7 of 10 asked”"),
    F("tables","MatchTables",False), F("settlement","CoinEntry[]",False,"Finished: coins this match moved for you"),
    F("markets","PredictionMarket[]",False,"Only if lines differ per match [Decide]")]),
  ("MatchEvent", "One line on the Facts timeline.", [
    F("id","string"), F("minute","int"), F("addedTime","int",False), F("side","\"home\" | \"away\""),
    F("kind","EventKind"), F("player","string",notes="Scorer, booked player, or player coming on"),
    F("detail","string",False,"Sub: player going off. VAR: the decision."),
    F("score","[int, int]",False,"Goals: running score after it")]),
  ("MatchStat", "One stats row. Neutral, the side ahead is bright.", [
    F("key","string",notes="possession, shots, shots_on_target, corners, fouls, offsides"),
    F("label","string"), F("home","number"), F("away","number"), F("unit","\"%\"",False)]),
  ("Lineup", "One XI on the shared pitch.", [
    F("formation","string",notes="“4-3-3”. The UI builds rows from it."),
    F("players","{ id, number, name, pos }[]",notes="GK first, then defence to attack, right to left"),
    F("bench","{ id, number, name, pos }[]",False)]),
  ("TableRow", "League table row.", [
    F("pos","int"), F("teamId","string"), F("code","string"), F("played","int"), F("gd","int"), F("points","int")]),
  ("MatchPreview", "Preview tab of an upcoming match.", [
    F("venue","{ name, city, capacity, surface }"), F("weather","{ tempC, sky }",False),
    F("referee","string",False), F("tv","string[]",False,"Where to watch, in the user's region"),
    F("form","{ home: FormResult[], away: FormResult[] }",notes="Last five, oldest first"),
    F("news","{ title, source, publishedAt, url? }",False)]),
  ("CrowdPoll", "“Who wins?” 1 · X · 2. The split stays hidden until you vote.", [
    F("votes","int",notes="Total"), F("yourVote","\"1\" | \"X\" | \"2\"",False),
    F("split","{ home, draw, away }",False,"Percent, sums to 100. Only sent after you vote."),
    F("topScore","[int, int]",False)]),
  ("LiveQuestion", "A system Yes/No question during a live match. Points only, free.", [
    F("id","string"), F("index","int",notes="4 → “QUESTION 4 OF 10”"), F("total","int"),
    F("text","string",notes="Ends with the minute: “Next corner before 75'?”"), F("hint","string",False),
    F("opensAt","ISO datetime"), F("closesAt","ISO datetime",notes="Drives the countdown ring"),
    F("resolvesAt","string",notes="Match minute label, “75'”"), F("state","QuestionState"),
    F("yourAnswer","\"yes\" | \"no\"",False), F("yesShare","int",False,"Only after you answer or once closed"),
    F("outcome","\"yes\" | \"no\"",False), F("resolvedLabel","string",False,"“Corner at 71'”"),
    F("pointsAwarded","int",False,"50 if you were right")]),
  ("PredictionMarket", "One prediction type you can add to a slip.", [
    F("type","PredictionType"), F("label","string",notes="“Win / draw”"), F("minStake","int"),
    F("options","{ value, label }[]",notes="See the PredictionType enum")]),
  ("Prediction", "One row of a slip.", [
    F("id","string"), F("type","PredictionType"), F("pick","string",notes="One option value"),
    F("stake","int",notes="Coins"), F("potentialPayout","int",notes="Server computed: stake × 2, × 2 again on a boost match"),
    F("result","\"right\" | \"wrong\" | \"void\"",False), F("payout","int",False,"Coins actually paid"),
    F("points","int",False,"50 if right")]),
  ("PredictionSlip", "Your predictions on one match (and one challenge).", [
    F("matchId","string"), F("challengeId","string",False,"Null = personal slip [Decide]"),
    F("items","Prediction[]"), F("totalStake","int"), F("editableUntil","ISO datetime",notes="= kickoffAt"),
    F("rules","ChallengeRules & { setBy?: UserRef }",False)]),
  ("ChallengeRules", "How a challenge prices predictions.", [
    F("stake","\"free\" | { fixed: int }",notes="free = each player picks (at least the minimum); fixed = set by the creator"),
    F("cap","int",False,"Most one player can stake in total on the match")]),
  ("Challenge", "A friends' league on one match.", [
    F("id","string"), F("name","string",notes="Up to 20 chars"), F("code","string",notes="Invite code, “sun9k”"),
    F("inviteUrl","string"), F("match","MatchSummary"), F("entry","500 | 1500 | 2500"),
    F("rules","ChallengeRules"), F("modes","{ system, friends, pre }",notes="Booleans"),
    F("members","UserRef[]",notes="Joined players"), F("invited","UserRef[]",False),
    F("status","ChallengeStatus",notes="From the caller's point of view"), F("createdBy","UserRef"),
    F("mine","boolean"), F("from","UserRef",False,"Who invited you"), F("rank","int",False),
    F("pool","PoolSplit",notes="Server computed"), F("standings","Standing[]",False), F("unread","int",False,"Chat badge")]),
  ("PoolSplit", "How the pool pays out.", [
    F("pool","int"), F("burned","int"), F("payouts","int[]",notes="[winner] or [1st, 2nd]")]),
  ("Standing", "One player in a league table.", [
    F("user","UserRef"), F("points","int"), F("rank","int",notes="Ties share a rank"),
    F("delta","int",False,"Places moved since the last resolved call"), F("right","int",False), F("calls","int",False)]),
  ("MatchTables", "“Two tables, same calls”.", [
    F("free","{ joined, rank?, players, rewards }",notes="Always open, top 3 get 400 / 300 / 200"),
    F("coin","{ challengeId, league, entry, players, pool: PoolSplit }",False)]),
  ("ChatMessage", "One item in a league thread. `kind` decides the other fields.", [
    F("id","string"), F("kind","ChatKind"), F("from","UserRef",False,"Absent on system messages"),
    F("sentAt","ISO datetime"), F("text","string",False,"text / preset / system"),
    F("stickerId","string",False,"sticker"), F("question","FriendQuestion",False,"question")]),
  ("FriendQuestion", "A Yes/No question a member asked the league.", [
    F("id","string"), F("text","string",notes="Up to 60 chars"), F("closes","string",notes="“80'” or “kickoff”"),
    F("closesAt","ISO datetime",False), F("askerCall","\"yes\" | \"no\""), F("yourCall","\"yes\" | \"no\"",False),
    F("answers","{ yes, no }",False), F("outcome","\"yes\" | \"no\" | \"void\"",False)]),
  ("Wallet", "Three numbers that never mix.", [
    F("coins","int",notes="Play money"), F("points","int",notes="Skill. Never shown with a coin."), F("prizes","int")]),
  ("CoinEntry", "One row of the coin ledger. Every row says why.", [
    F("id","string"), F("label","string",notes="“Seaside pool”"), F("reason","string",notes="“1st of 2 · 5% burned”"),
    F("amount","int",notes="+ gain, − spend"), F("at","ISO datetime"), F("kind","CoinKind"),
    F("ref","{ matchId?, challengeId?, missionId? }",False)]),
  ("Mission", "A starter or weekly mission.", [
    F("id","string"), F("title","string"), F("coins","int"), F("doneAt","ISO datetime",False),
    F("doneReason","string",False,"“You picked Liverpool”")]),
  ("IslandLive", "Your live match in the top pill.", [
    F("matchId","string"), F("challengeId","string",False), F("home","string",notes="Team code"),
    F("away","string"), F("score","[int, int]"), F("minute","int"),
    F("question","{ id, index, text, resolvesAt, state, closesAt }",False)]),
  ("Me", "The signed-in user. Drives the island, level bar, dock and first-run redirect.", [
    F("user","UserRef"), F("onboardedAt","ISO datetime | null",notes="Null → send to /welcome"),
    F("wallet","Wallet"), F("level","{ level, xp, xpNext, badges }",notes="Placeholder until the gamification doc"),
    F("favouriteTeams","Team[]"), F("streak","{ current, best }"), F("referral","{ code, bonus, joined }"),
    F("tier","{ name, rank, of }",notes="“Silver, rank 8 of 30”"), F("activeCalls","int"),
    F("live","IslandLive",False)]),
]
TYPE_NAMES = sorted([t[0] for t in TYPES] + ["MatchStatus","Period","EventKind","QuestionState","PredictionType","ChallengeStatus","ChatKind","CoinKind","FormResult"], key=len, reverse=True)

ENUMS = [
  ("MatchStatus", "upcoming · live · finished", "postponed / abandoned / cancelled still to decide"),
  ("Period", "1h · ht · 2h · et · pens · ft", ""),
  ("EventKind", "goal · own_goal · penalty_goal · yellow · second_yellow · red · sub · var", ""),
  ("QuestionState", "open · closed · resolved · void", ""),
  ("PredictionType", "result · goals · corners · yellows · red · penalty", "See the markets table"),
  ("ChallengeStatus", "invited · joined · expired · finished", "From the caller's point of view"),
  ("ChatKind", "text · preset · sticker · question · system", ""),
  ("CoinKind", "entry · pool_win · prediction_stake · prediction_payout · prediction_refund · mission · free_table · chat_question · create_league · earn · purchase", ""),
  ("FormResult", "W · D · L", "Team form; profile form uses W · L · V (void)"),
]

MARKETS = [
  ("result","Win / draw","100","1 (home) · X (draw) · 2 (away)"),
  ("goals","Goals","100","Under 2.5 · Over 2.5 · Over 3.5"),
  ("corners","Corners","100","Under 9.5 · Over 9.5 · Over 11.5"),
  ("yellows","Yellow cards","100","Under 3.5 · Over 3.5 · Over 5.5"),
  ("red","Red card","200","Yes · No"),
  ("penalty","Penalty","200","Yes · No"),
]

# ------------------------------------------------------------------ endpoints
J = lambda o: json.dumps(o, indent=2, ensure_ascii=False)

ENDPOINTS = [
 # ---- Session
 dict(group="Session", method="POST", path="/v1/auth/telegram", summary="Log in with Telegram.", auth=False, decide=True,
   body=[F("initData","string",notes="Telegram login payload, verified server side")],
   resp=[R("accessToken","string"),R("refreshToken","string"),R("expiresIn","int","Seconds"),R("me","Me")],
   errors=[("401","INVALID_LOGIN","Signature check failed")],
   notes=["The invite links are t.me/footon_bot?start=<code>, so Telegram looks like the main identity. Please confirm."]),
 dict(group="Session", method="POST", path="/v1/auth/refresh", summary="Swap a refresh token for a new access token.", auth=False,
   body=[F("refreshToken","string")], resp=[R("accessToken","string"),R("refreshToken","string"),R("expiresIn","int")],
   errors=[("401","INVALID_TOKEN","Expired or revoked")]),
 dict(group="Session", method="GET", path="/v1/me", summary="The signed-in user, wallet and your live match. Called on every app open.",
   resp=[R("…","Me","See the Me type")],
   example_resp=J({"user":{"id":"u_1","name":"Zohre","initial":"Z","you":True},"onboardedAt":"2026-10-31T19:02:11Z",
     "wallet":{"coins":6450,"points":4820,"prizes":0},"level":{"level":7,"xp":640,"xpNext":1000,"badges":3},
     "favouriteTeams":[{"id":"t_liv","code":"LIV","name":"Liverpool","colors":["#C8102E","#F6EB61"]}],
     "streak":{"current":3,"best":6},"referral":{"code":"FOOT-Y7K2","bonus":1500,"joined":2},
     "tier":{"name":"Silver","rank":8,"of":30},"activeCalls":2,
     "live":{"matchId":"liv-mci","challengeId":"ch-1","home":"LIV","away":"MCI","score":[1,1],"minute":67,
       "question":{"id":"q_4","index":4,"text":"Next corner before 75'?","resolvesAt":"75'","state":"open","closesAt":"2026-11-03T21:12:38Z"}}}),
   notes=["`live` is your live match: the one in a joined challenge. If several are live, return the one with an open question first.",
          "Replaces the `footon_onboarded` cookie: `onboardedAt: null` means show onboarding."]),
 dict(group="Session", method="GET", path="/v1/config", summary="Economy numbers and prediction markets, so the app stops hard-coding them. Cache for an hour.",
   resp=[R("entryTiers","int[]","[500, 1500, 2500]"),R("poolBurn","number","0.05"),R("splitFrom","int","5"),R("split","number[]","[0.7, 0.3]"),
         R("freeTable","{ rewards, weeklyCap }","[400, 300, 200], 2000"),R("costs","{ createLeague, chatQuestion }","1500, 250"),
         R("stakeSteps","int[]","[100, 250, 500, 1000]"),R("payoutMultiplier","int","2"),R("boostMultiplier","int","2"),
         R("pointsPerRightCall","int","50"),R("hotStreak","int","3"),R("starter","{ total, days }","15000, 7"),
         R("limits","{ leagueName, chatQuestion }","20, 60"),R("markets","PredictionMarket[]")]),
 # ---- Onboarding
 dict(group="Onboarding", method="GET", path="/v1/onboarding", summary="The sample question, the club grid and the next three missions.",
   resp=[R("sample","{ match, minute, text, yesShare, outcome, resolvedLabel, reward }","Demo only. Answering it records nothing."),
         R("clubs","Team[]"),R("steps","{ title, coins }[]"),R("startingCoins","int","1000")]),
 dict(group="Onboarding", method="POST", path="/v1/onboarding/complete", summary="Save clubs, pay mission one, set onboardedAt.", idem=True, coins="Pays +1,000",
   body=[F("favouriteTeamIds","string[]"),F("claim","boolean",notes="false = “Skip to Home”: set onboardedAt, pay nothing")],
   resp=[R("onboardedAt","ISO datetime"),R("wallet","Wallet"),R("missionPaid","string",'"m-1" or absent')],
   example_req=J({"favouriteTeamIds":["t_liv"],"claim":True}),
   example_resp=J({"onboardedAt":"2026-11-03T18:00:00Z","wallet":{"coins":1000,"points":0,"prizes":0},"missionPaid":"m-1"}),
   notes=["Claiming pays only mission one. The other starter coins arrive mission by mission."]),
 # ---- Profile
 dict(group="Profile", method="PUT", path="/v1/me/favourite-teams", summary="Replace your clubs (Profile → Your clubs).",
   body=[F("teamIds","string[]")], resp=[R("favouriteTeams","Team[]")]),
 dict(group="Profile", method="GET", path="/v1/teams", summary="Club search for the “Add club” sheet.",
   query=[F("q","string",False,"Name or code. Without it, a popular set for the user's region."),F("limit","int",False,"Default 20")],
   resp=[R("items","Team[]")]),
 dict(group="Profile", method="GET", path="/v1/me/form", summary="Recent outcomes for the Profile form card.", decide=True,
   query=[F("limit","int",False,"Default 6")], resp=[R("items","(\"W\" | \"L\" | \"V\")[]","Oldest first. W right, L wrong, V void.")],
   notes=["Win rate = W / (W + L), computed in the app.","Decide: is one item one call, or one match?"]),
 dict(group="Profile", method="GET", path="/v1/me/achievements", summary="Achievement tiles and the collection list. Placeholder shape.",
   resp=[R("achievements","{ id, label, icon, earnedAt }[]"),R("collection","{ id, label, count?, locked? }[]","locked = “Unlocks at level 5”")]),
 dict(group="Profile", method="GET", path="/v1/leaderboards/{period}", summary="Weekly or monthly rank. Points only.",
   params=[F("period","\"weekly\" | \"monthly\"")], query=[F("cursor","string",False)],
   resp=[R("tier","string"),R("period","string"),R("endsAt","ISO datetime"),R("you","{ rank }"),R("items","Standing[]"),R("nextCursor","string | null")]),
 # ---- Home
 dict(group="Matches", method="GET", path="/v1/home", summary="Everything Home shows, in one call.",
   resp=[R("challenges","Challenge[]","Yours, joined. Live first, then by kickoff."),
         R("openPredictions","{ match: MatchSummary, count, editableUntil }[]","Upcoming matches where you have a locked slip"),
         R("invites","{ count, from: UserRef[] }","Invite tile: “Sara +2”"),
         R("fantasy","{ done, total, open }"),R("bigMatches","MatchSummary[]","boost = 2, upcoming, next 7 days")]),
 dict(group="Matches", method="GET", path="/v1/matches", summary="Matches for one day, grouped by competition (Live tab).",
   query=[F("date","YYYY-MM-DD",False,"Local day. Required unless live=true."),F("tz","IANA zone",False,"Used to cut the day"),
          F("live","boolean",False,"Only matches live now, any day"),F("competition","string",False)],
   resp=[R("date","string"),R("liveCount","int","“3 on now”"),R("groups","{ competition: Competition, matches: MatchSummary[] }[]")],
   notes=["Order groups by the user's favourite competitions, then popularity. Inside a group: live first, then by kickoff.",
          "The day strip goes from two days back to five ahead; the app calls this once per day."]),
 dict(group="Matches", method="GET", path="/v1/matches/{id}", summary="The match page, for any status.",
   params=[F("id","string")], query=[F("include","string",False,"Optional: events,stats,lineups to trim the payload")],
   resp=[R("…","MatchDetail","Sections the UI doesn't get are hidden")],
   errors=[("404","NOT_FOUND","Unknown match")]),
 dict(group="Matches", method="POST", path="/v1/matches/{id}/crowd-vote", summary="Vote in the 1 · X · 2 poll. Free.", decide=True,
   params=[F("id","string")], body=[F("pick","\"1\" | \"X\" | \"2\"")], resp=[R("crowd","CrowdPoll","Now includes split")],
   errors=[("409","ALREADY_ANSWERED","Second vote (or allow a change)")],
   example_req=J({"pick":"1"}),
   example_resp=J({"crowd":{"votes":18413,"yourVote":"1","split":{"home":41,"draw":33,"away":26},"topScore":[2,1]}})),
 # ---- Predictions
 dict(group="Predictions", method="GET", path="/v1/matches/{id}/slip", summary="Your prediction slip on a match.", decide=True,
   params=[F("id","string")], query=[F("challengeId","string",False,"Slip for this challenge; omit for your personal slip")],
   resp=[R("…","PredictionSlip"),R("markets","PredictionMarket[]")],
   example_resp=J({"matchId":"ars-che","challengeId":"ch-2","rules":{"stake":{"fixed":250},"cap":1500,"setBy":{"id":"u_sara","name":"Sara","initial":"S"}},
     "editableUntil":"2026-11-03T21:00:00Z","items":[{"id":"p-1","type":"result","pick":"1","stake":250,"potentialPayout":1000},
     {"id":"p-2","type":"corners","pick":"Over 9.5","stake":250,"potentialPayout":1000}],"totalStake":500}),
   notes=["potentialPayout is 1,000 because ars-che is a boost match: 250 × 2 × 2.","Empty slip → items: []."]),
 dict(group="Predictions", method="PUT", path="/v1/matches/{id}/slip", summary="Lock in or edit the whole slip. Charges or refunds the difference.", idem=True, coins="Charges the stake difference",
   params=[F("id","string")], body=[F("challengeId","string",False),F("items","{ type, pick, stake }[]",notes="One per type. Empty = withdraw, refund all.")],
   resp=[R("slip","PredictionSlip"),R("wallet","Wallet"),R("charged","int","Negative = refund")],
   errors=[("409","PREDICTIONS_LOCKED","After kickoff"),("422","INVALID_PICK","Option not offered"),("422","STAKE_BELOW_MIN","Under the type's minimum"),
           ("422","STAKE_NOT_FIXED","Challenge has a fixed stake"),("422","OVER_CAP","Total over the challenge cap"),("402","INSUFFICIENT_COINS","details.short = coins missing")],
   example_req=J({"challengeId":"ch-2","items":[{"type":"result","pick":"1","stake":250},{"type":"corners","pick":"Over 9.5","stake":250},{"type":"red","pick":"No","stake":250}]}),
   example_resp=J({"slip":"PredictionSlip","wallet":{"coins":5700},"charged":250})),
 # ---- Live
 dict(group="Live questions", method="POST", path="/v1/questions/{id}/answer", summary="Answer a live Yes/No question. Free, points only.",
   params=[F("id","string")], body=[F("answer","\"yes\" | \"no\"")], resp=[R("question","LiveQuestion","Now includes yesShare")],
   errors=[("409","QUESTION_CLOSED","After closesAt (allow ~1s grace)"),("409","ALREADY_ANSWERED","")],
   example_req=J({"answer":"yes"}),
   example_resp=J({"question":{"id":"q_4","state":"open","yourAnswer":"yes","yesShare":58,"resolvesAt":"75'"}}),
   notes=["On resolution: right → +50 points, streak +1. Wrong → streak back to 0. Both pushed over realtime."]),
 # ---- Challenges
 dict(group="Challenges", method="GET", path="/v1/challenges", summary="Your challenges by status.",
   query=[F("status","string",False,"joined, invited, expired, finished. Comma-separated."),F("cursor","string",False)],
   resp=[R("items","Challenge[]"),R("nextCursor","string | null")]),
 dict(group="Challenges", method="POST", path="/v1/challenges", summary="Create a league. Costs 1,500 plus your own entry.", idem=True, coins="−(1,500 + entry)", decide=True,
   body=[F("name","string",notes="1–20 chars"),F("matchId","string",notes="An upcoming match"),F("entry","500 | 1500 | 2500"),
         F("rules","ChallengeRules"),F("modes","{ system, friends, pre }"),F("inviteUserIds","string[]",False)],
   resp=[R("challenge","Challenge"),R("wallet","Wallet"),R("charged","int")],
   errors=[("402","INSUFFICIENT_COINS","details.short"),("422","VALIDATION","details.fields"),("409","PREDICTIONS_LOCKED","Match already started")],
   example_req=J({"name":"Sunday Rivals","matchId":"liv-mci","entry":1500,"rules":{"stake":{"fixed":250},"cap":2500},
     "modes":{"system":True,"friends":True,"pre":False},"inviteUserIds":[]}),
   example_resp=J({"challenge":"Challenge","wallet":{"coins":3450},"charged":3000}),
   notes=["The creator joins automatically.","Decide: the create form has no match picker yet. Start creation from a match page, or add a picker."]),
 dict(group="Challenges", method="GET", path="/v1/challenges/{id}", summary="The challenge page: rules, pool, members, standings, your slip.",
   params=[F("id","string")], resp=[R("challenge","Challenge"),R("slip","PredictionSlip","Yours, if joined"),R("chat","{ unread }")],
   errors=[("404","NOT_FOUND","Also when you're neither a member nor invited (don't leak private leagues)")]),
 dict(group="Challenges", method="POST", path="/v1/challenges/{id}/accept", summary="Accept an invite and pay the entry.", idem=True, coins="−entry",
   params=[F("id","string")], resp=[R("challenge","Challenge"),R("wallet","Wallet"),R("charged","int")],
   errors=[("402","INSUFFICIENT_COINS",""),("409","CHALLENGE_NOT_OPEN","Expired or started"),("409","CHALLENGE_FULL","Max size, still to decide")]),
 dict(group="Challenges", method="POST", path="/v1/challenges/{id}/decline", summary="Decline an invite. Reversible until kickoff.", decide=True,
   params=[F("id","string")], resp=[R("challenge","Challenge")]),
 dict(group="Challenges", method="DELETE", path="/v1/challenges/{id}/decline", summary="Undo a decline.",
   params=[F("id","string")], resp=[R("challenge","Challenge")], errors=[("409","CHALLENGE_NOT_OPEN","After kickoff")]),
 dict(group="Challenges", method="GET", path="/v1/invites", summary="Pending invites, sorted by kickoff (invite strip, /invites, invite tile).",
   resp=[R("items","Challenge[]","status = invited, with from")]),
 dict(group="Challenges", method="GET", path="/v1/invites/{code}", summary="Public preview of an invite link. Works for non-members.",
   params=[F("code","string")], resp=[R("challenge","Challenge","Name, match, entry, rules, member count, pool")]),
 dict(group="Challenges", method="POST", path="/v1/invites/{code}/join", summary="Join from a link. Same as accept, and records the referral.", idem=True, coins="−entry",
   params=[F("code","string")], resp=[R("challenge","Challenge"),R("wallet","Wallet"),R("charged","int")],
   errors=[("402","INSUFFICIENT_COINS",""),("409","CHALLENGE_NOT_OPEN",""),("409","CHALLENGE_FULL","")]),
 # ---- Chat
 dict(group="Chat", method="GET", path="/v1/challenges/{id}/chat", summary="The league thread, paged backwards. Members only.",
   params=[F("id","string")], query=[F("before","string",False,"Message id"),F("limit","int",False,"Default 50")],
   resp=[R("members","UserRef[]"),R("online","string[]","User ids"),R("items","ChatMessage[]","Oldest to newest"),R("nextCursor","string | null","Older page")]),
 dict(group="Chat", method="POST", path="/v1/challenges/{id}/chat/messages", summary="Send text, a preset phrase or a sticker.", decide=True,
   params=[F("id","string")], body=[F("kind","\"text\" | \"preset\" | \"sticker\""),F("text","string",False,"Length cap still to decide (280?)"),
     F("stickerId","string",False),F("clientId","string",False,"Matches the optimistic bubble")],
   resp=[R("message","ChatMessage")], example_req=J({"kind":"text","text":"City are all over them now","clientId":"c-123"})),
 dict(group="Chat", method="POST", path="/v1/challenges/{id}/chat/questions", summary="“Ask the league” a Yes/No question. Costs 250.", idem=True, coins="−250", decide=True,
   params=[F("id","string")], body=[F("text","string",notes="Up to 60 chars"),F("call","\"yes\" | \"no\"",notes="The asker's own call"),F("closes","string",notes="“80'” or “kickoff”")],
   resp=[R("message","ChatMessage"),R("wallet","Wallet"),R("charged","int")],
   errors=[("402","INSUFFICIENT_COINS",""),("422","VALIDATION","Too long")],
   example_req=J({"text":"Yellow card before 80'?","call":"yes","closes":"80'"}),
   notes=["The asker earns 50 per friend who answers, up to 250 a question.","Decide: how friend questions resolve."]),
 dict(group="Chat", method="POST", path="/v1/chat-questions/{id}/answer", summary="Answer a friend's question. Free.",
   params=[F("id","string")], body=[F("answer","\"yes\" | \"no\"")], resp=[R("question","FriendQuestion")],
   errors=[("409","QUESTION_CLOSED",""),("409","ALREADY_ANSWERED","")]),
 dict(group="Chat", method="GET", path="/v1/chat/presets", summary="Quick reactions, the banter palette and sticker ids.",
   resp=[R("reactions","string[]","“VAR!”, “Offside”, “What a save”"),R("groups","{ group, phrases[] }[]","Banter · Ref · Goal"),R("stickers","string[]","Art ships in the app; the server stores ids")]),
 # ---- Wallet
 dict(group="Wallet", method="GET", path="/v1/wallet", summary="Balance, starter missions, weekly caps, ways to earn, first page of activity.",
   resp=[R("wallet","Wallet"),R("starter","{ day, days, total, missions: Mission[] }","Gone after day 7"),
         R("weekly","{ mission, caps[] }","caps: { id, label, used, cap, period, unit? }"),
         R("earnWays","{ id, label, detail, coins, cap }[]","cap is display text"),R("activity","{ items: CoinEntry[], nextCursor }")]),
 dict(group="Wallet", method="GET", path="/v1/wallet/activity", summary="Coin history, newest first.",
   query=[F("cursor","string",False)], resp=[R("items","CoinEntry[]"),R("nextCursor","string | null")]),
 # ---- Shop
 dict(group="Shop & fantasy", method="GET", path="/v1/shop", summary="Phase 2 catalogue: real items and prices, no payment.",
   resp=[R("groups","{ group, note?, items[] }[]","item: { id, name, detail, coins?, price?, pack?, icon }"),
         R("…price","{ amount, currency, display }","Minor units + display string, per region"),
         R("…coins","int | [min, max]","A range for families of looks")]),
 dict(group="Shop & fantasy", method="POST", path="/v1/shop/notify", summary="“Notify me when the shop opens.”",
   body=[F("itemId","string")], resp=[R("—","204 No Content")]),
 dict(group="Shop & fantasy", method="POST", path="/v1/analytics/events", summary="Shop intent events. Skip if we send these to an analytics tool directly.",
   body=[F("events","{ name, props, at }[]",notes="name: shop_open · shop_item_tap · shop_notify")], resp=[R("—","204 No Content")]),
 dict(group="Shop & fantasy", method="GET", path="/v1/fantasy", summary="Fantasy unlock progress (Home tile). Full spec later.", decide=True,
   resp=[R("unlock","{ done, total, open }","“3/5”")]),
]

EVENTS = [
  ("match.clock","match","{ minute, addedTime?, period }","Minute and clock bar. About every 60s or on period change."),
  ("match.score","match","{ score, redCards? }","Scoreboard and island"),
  ("match.event","match","MatchEvent","Facts timeline, scorers"),
  ("match.event_removed","match","{ id }","VAR overturn"),
  ("match.stats","match","MatchStat[]","Stats tab"),
  ("match.status","match","{ status, period }","Kickoff locks slips; full time"),
  ("crowd.updated","match","{ votes, split }","Poll. Throttle to about 5s."),
  ("question.opened","match","LiveQuestion","Deals the card, starts the ring"),
  ("question.closed","match","{ id, yesShare }","“Waiting for 75'…”"),
  ("question.resolved","match","{ id, outcome, resolvedLabel }","Right or wrong, +50"),
  ("question.void","match","{ id, reason }","Removed, no penalty"),
  ("standings.updated","challenge","Standing[]","League tiles"),
  ("chat.message","challenge","ChatMessage","Thread"),
  ("chat.question_updated","challenge","FriendQuestion","Answer counts, outcome"),
  ("challenge.member_joined","challenge","UserRef","Members and pool"),
  ("challenge.settled","challenge","{ rank, payouts }","Full time screen"),
  ("wallet.updated","user","{ coins, points, delta, entry: CoinEntry }","Island coin tick"),
  ("you.updated","user","{ matchId, you: MatchYou }","Streak flame, +points"),
  ("slip.resolved","user","{ matchId, challengeId?, items: Prediction[] }","Right / wrong rows"),
  ("invite.received","user","Challenge","Invite tile count"),
  ("mission.completed","user","Mission","Wallet missions"),
  ("level.updated","user","{ level, xp, xpNext, badges }","Level bar"),
]

ERRORS = [
  ("402","INSUFFICIENT_COINS","{ short }","“Need N more coins” and a link to ways to earn"),
  ("409","PREDICTIONS_LOCKED","{ lockedAt }","Slip after kickoff"),
  ("409","QUESTION_CLOSED","{ closedAt }","Live question timer ran out"),
  ("409","ALREADY_ANSWERED","{ answer }","Live or chat question, crowd poll"),
  ("409","CHALLENGE_NOT_OPEN","{ status }","Accepting an expired invite"),
  ("409","CHALLENGE_FULL","—","Joining a full league"),
  ("422","STAKE_BELOW_MIN","{ type, min }","Prediction row"),
  ("422","STAKE_NOT_FIXED","{ fixed }","Challenge with a fixed stake"),
  ("422","OVER_CAP","{ cap, total, over }","Slip total over the cap"),
  ("422","INVALID_PICK","{ type, pick }","Option not offered"),
  ("422","VALIDATION","{ fields }","Forms"),
  ("429","CAP_REACHED","{ capId }","Weekly earn caps (info only)"),
  ("401","UNAUTHENTICATED","—","Token missing or expired: refresh"),
  ("404","NOT_FOUND","—","Unknown or private resource"),
]

CONVENTIONS = [
  ("Transport","REST + JSON over HTTPS, base path /v1. One WebSocket for pushes (SSE also fine)."),
  ("Auth","Authorization: Bearer <token> on everything except /v1/auth/*."),
  ("IDs","Opaque strings. The app never parses them."),
  ("Times","ISO 8601 in UTC. The app formats “21:00”, “Tomorrow”, “Thu 5 Nov” itself. Never send display labels."),
  ("Coins, points, XP","Integers. No decimals. Negative = a spend."),
  ("Percentages","Integers 0–100. Splits sum to 100; round on the server."),
  ("Match minute","minute + optional addedTime (45+2')."),
  ("Missing data","Omit the field or send null. Never invent stats: the app hides a tab when its data is missing."),
  ("Pagination","?limit=20&cursor=… → { items, nextCursor }."),
  ("Idempotency","Every call that moves coins takes an Idempotency-Key header. A retry returns the first result and never charges twice."),
  ("Coin writes","Return the new wallet with the payload, so the island updates without a refetch."),
  ("Errors","{ error: { code, message, details } }. The app writes its own copy from code + details."),
]

CURRENCIES = [
  ("Points","Skill","Right calls only (+50)","Nothing","Rank, leaderboards, prizes"),
  ("Coins","Play money","Missions, pool wins, right predictions, free table top 3","Entries, stakes, chat questions, creating a league, later the shop","Wallet, stakes, payouts"),
  ("Prizes","Real items from sponsors","Weekly or monthly rank (points)","—","Wallet strip"),
]

RULES = [
  ("Entry tiers","500 · 1,500 · 2,500","Per player per match. 2,500 is the cap.","ENTRY_TIERS"),
  ("Pool burn","5%","Rounded. A coin sink, not revenue.","POOL_BURN"),
  ("Pool split","All / 70·30","Under 5 players the winner takes it all; from 5 it's 70 / 30.","SPLIT_FROM, SPLIT"),
  ("Free table","400 · 300 · 200","Always open, no entry. Max 2,000 per user per week.","FREE_TABLE_*"),
  ("Create a league","1,500","Plus your own entry.","COSTS.createLeague"),
  ("Chat question","250","","COSTS.chatQuestion"),
  ("Min stake","100 / 200","100 for result, goals, corners, yellows. 200 for red, penalty.","PREDICTION_MIN_STAKE"),
  ("Right prediction","× 2","Stake included.","PAYOUT_MULTIPLIER"),
  ("Big match boost","× 2","Again, on coins only. Never on points.","BOOST_MULTIPLIER"),
  ("Points per right call","50","Live questions and predictions. Never bought, never boosted.","POINTS_PER_RIGHT_CALL"),
  ("Hot streak","3","Right calls in a row.","HOT_STREAK"),
  ("Starter coins","15,000","Over 7 days. Onboarding pays only mission one (1,000).","STARTER_*"),
]

HARD_RULES = [
  "Points, coins and prizes never mix. Rank and prizes read points only. An entry or stake never changes rank.",
  "Coins can't be cashed out or sent to another user.",
  "Nothing that earns points is for sale. No mystery boxes.",
  "No pressure selling: no purchase prompts after a loss or on a low balance, no fake timers, no “sold out”.",
  "Coin packs are 18+ with a monthly limit (when payments ship).",
  "The ledger is append-only. Balance = sum of CoinEntry rows and never goes below zero.",
  "The server is the authority. Never trust a total or payout the app computed.",
]

SETTLEMENT = [
  ("Prediction right","stake × 2 (× 2 again on boost) + 50 points","prediction_payout"),
  ("Prediction wrong","Nothing back","—"),
  ("Prediction void","Stake refunded","prediction_refund"),
  ("Live question right","+50 points, streak +1","— (points only)"),
  ("Live question wrong","Streak back to 0","—"),
  ("Pool, under 5 players","Winner takes pool − 5%","pool_win"),
  ("Pool, 5 or more","1st floor(net × 0.7), 2nd the rest","pool_win"),
  ("Pool ties","Places shared evenly; odd coins burn (proposal)","pool_win"),
  ("League with only the creator","Entry refunded","entry (+)"),
  ("Free table top 3","400 / 300 / 200, weekly cap 2,000","free_table"),
]

POOL_EXAMPLES = [("4 × 1,500","6,000","300","5,700"),("7 × 500","3,500","175","2,327 / 998")]

MISSIONS = [
  ("m-1","Pick your club and profile","1,000","Onboarding complete with claim: true"),
  ("m-2","Make your first call","1,000","First live answer or locked prediction"),
  ("m-3","Join your first friends' league","2,000","First accept, join or create"),
  ("m-4","Invite a friend who joins","2,000","Someone joins with your code"),
  ("m-5","Stay to the end of a match","2,000","3+ answers and still answering at 90'"),
  ("m-6","Answer 10 live questions","1,500","10th answer"),
  ("m-7","Ask your first question in chat","1,500","First chat question"),
  ("m-8","Come back on day 3","2,000","Any session on day 3 after signup"),
  ("m-9","Win a pool or the free table","2,000","First pool_win or free table top 3"),
]

EARN = [
  ("e-1","Watch to the end","3+ answers to 90'","100","Every match"),
  ("e-2","Free table top 3","400 / 300 / 200","400","2,000 a week"),
  ("e-3","Rare call right","Under 20% picked it","50","150 a match"),
  ("e-4","Five matches in a row","To the end each time","500","Every 5 matches"),
  ("e-5","A friend finishes a match","Their first, after your invite","1,500","6 a month"),
  ("e-6","Friends answer your question","50 for each friend","50","250 a question"),
  ("e-7","Up a weekly league","Promotion","1,000","Weekly"),
]

TABS = [
  ("upcoming","Predict · Preview · Table · H2H","crowd, tables, preview, table, h2h + slip"),
  ("live","Predict · Chat · Facts · Stats · Lineups · Table · H2H","question, progress, crowd, events, stats, lineups, table, h2h + standings"),
  ("finished","Result · Facts · Stats · Table · H2H","you, settlement, events, stats, table, h2h + resolved slip"),
]

SCREENS = [
  ("First run","/ (proxy)","GET /v1/me","—","—"),
  ("Onboarding","/welcome","GET /v1/onboarding","POST /v1/onboarding/complete","—"),
  ("Tabs shell","island, level bar, dock","GET /v1/me","POST /v1/questions/{id}/answer","user, match"),
  ("Home","/","GET /v1/home","—","user"),
  ("Challenges","/challenges","GET /v1/challenges, GET /v1/invites","accept, decline, undo","user"),
  ("Invites","/invites","GET /v1/invites","accept, decline, undo","user"),
  ("Create league","/challenges/new","GET /v1/me, GET /v1/config","POST /v1/challenges","—"),
  ("Challenge","/challenges/[id]","GET /v1/challenges/{id}, chat","accept, decline, PUT slip, chat","challenge, match"),
  ("Live tab","/live","GET /v1/matches?date=…","—","match (live rows)"),
  ("Match","/match/[id]","GET /v1/matches/{id}, GET slip","crowd vote, PUT slip, answer","match"),
  ("Your live match","/play","match, challenge, chat","answer, chat, crowd vote","match, challenge, user"),
  ("Profile","/me","GET /v1/me, /me/form, /me/achievements","PUT /v1/me/favourite-teams","user"),
  ("Wallet","/wallet","GET /v1/wallet","activity paging","user"),
  ("Shop","/shop","GET /v1/shop","POST /v1/shop/notify, analytics","—"),
  ("Fantasy","/fantasy","GET /v1/fantasy","— (spec pending)","—"),
]

MAPPING = [
  ("Match.kickoff: \"21:00\"","kickoffAt (ISO)","The app formats in local time"),
  ("Match.day, dayOffset","derived from kickoffAt","No display labels from the API"),
  ("Match.caption","derived","Display only"),
  ("Match.competition: string","competition: Competition","Needs country and code"),
  ("Match.league: string","league: { challengeId, name }","Needs to link"),
  ("Match.market","dropped for now","Not on current screens"),
  ("Match.crowd.home/draw/away","crowd.split, after voting","Split hidden until you vote"),
  ("liveQuestion.seconds","closesAt","Countdown survives a reload"),
  ("liveQuestion (global)","MatchDetail.question + realtime","Per match"),
  ("Challenge.members: [\"Y\",\"S\"] + people","members: UserRef[]","Real users"),
  ("Challenge.matchId","match: MatchSummary","Saves a lookup"),
  ("Invite (derived)","GET /v1/invites → Challenge","One type"),
  ("league (global)","Challenge.standings, code, inviteUrl","Per challenge"),
  ("predictionSlips[matchId]","GET /v1/matches/{id}/slip",""),
  ("Prediction (no payout)","+ potentialPayout, payout, points","Server computes money"),
  ("chat, prematchChat","GET /v1/challenges/{id}/chat",""),
  ("wallet.coins, profile.points","Me.wallet",""),
  ("profile.favoriteTeams: [\"LIV\"]","favouriteTeams: Team[]",""),
  ("fantasyProgress","GET /v1/fantasy → unlock",""),
  ("starter, weekly, earnWays, coinActivity","GET /v1/wallet",""),
  ("CoinEntry.day: \"Today\"","at (ISO)",""),
  ("ShopItem.price: \"$4.99\"","price: { amount, currency, display }","Regional pricing"),
  ("Profile RANK / OF constants","Me.tier",""),
  ("mockToday","server time",""),
]

QUESTIONS = [
  ("Login","Telegram as the identity? Other providers? Guest play before sign-in?","Telegram first"),
  ("Slip scope","One slip per (user, match, challenge), or one per match?","Per challenge; null = personal"),
  ("Prediction lines","Fixed in /config, or per match?","Fixed for v1"),
  ("Live questions","Who writes and resolves them; which data feed (needs live corners and cards)?","—"),
  ("Friend questions","How they resolve; does the asker's call earn points?","—"),
  ("Match states","Postponed, abandoned, cancelled: what's refunded?","Full refund, result void"),
  ("League size","Max members? Join after kickoff?","No joining after kickoff"),
  ("Decline","Is the inviter told? Does a declined invite become expired at kickoff?","—"),
  ("Pool ties","Rounding of odd coins","Floor, remainder burns"),
  ("Island","Only your league's live match, or any match you've touched?","Your league's"),
  ("Crowd poll","Vote until kickoff or full time? Can you change it?","Until FT, no change"),
  ("Recent form","Is one item one call or one match?","—"),
  ("Chat","Retention after FT, message length, moderation and reporting","280 chars"),
  ("Fantasy","What counts toward unlock; full spec","—"),
  ("Level / XP","What earns XP? Waiting on the gamification doc","—"),
  ("Localisation","Persian (RTL) is planned. Localised server text via Accept-Language?","Yes, for server-written text"),
  ("Time zone","From the device (tz param) or the profile?","Device"),
]

# ------------------------------------------------------------------ render helpers
type_re = re.compile(r"\b(" + "|".join(TYPE_NAMES) + r")\b")
def typ(s):
    out = E(s)
    return type_re.sub(lambda m: f'<a class="tl" href="#t-{m.group(1)}">{m.group(1)}</a>', out)

def md(s):
    s = E(s)
    s = re.sub(r"`([^`]+)`", r"<code>\1</code>", s)
    s = s.replace("Decide:", '<span class="decide">Decide</span>')
    return s

def slug(ep):
    return "ep-" + ep["method"].lower() + "-" + re.sub(r"[^a-z0-9]+", "-", ep["path"].lower()).strip("-")

def table(head, rows, cls=""):
    th = "".join(f"<th>{h}</th>" for h in head)
    trs = "".join("<tr>" + "".join(f"<td>{c}</td>" for c in r) + "</tr>" for r in rows)
    return f'<div class="tw"><table class="{cls}"><thead><tr>{th}</tr></thead><tbody>{trs}</tbody></table></div>'

def badge(m):
    return f'<span class="m m-{m.lower()}">{m}</span>'

def req(b):
    return '<span class="req">required</span>' if b else '<span class="opt">optional</span>'

def fields_table(fs, with_req=True):
    if with_req:
        return table(["Field","Type","","Notes"], [[f"<code>{E(n)}</code>", typ(t), req(r), md(no)] for n,t,r,no in fs], "fields")
    return table(["Field","Type","Notes"], [[f"<code>{E(n)}</code>", typ(t), md(no)] for n,t,no in fs], "fields")

# ------------------------------------------------------------------ sections
groups = []
for ep in ENDPOINTS:
    if ep["group"] not in groups: groups.append(ep["group"])

def ep_html(ep):
    chips = []
    chips.append('<span class="chip">Auth</span>' if ep.get("auth", True) else '<span class="chip chip-dim">No auth</span>')
    if ep.get("idem"): chips.append('<span class="chip">Idempotency-Key</span>')
    if ep.get("coins"): chips.append(f'<span class="chip chip-coin">{E(ep["coins"])}</span>')
    if ep.get("decide"): chips.append('<a class="chip chip-decide" href="#questions">Open question</a>')
    parts = [f'<article class="ep" id="{slug(ep)}">',
             f'<header class="ep-h">{badge(ep["method"])}<code class="path">{E(ep["path"])}</code></header>',
             f'<p class="ep-sum">{md(ep["summary"])}</p>',
             f'<div class="chips">{"".join(chips)}</div>']
    if ep.get("params"): parts += ['<h4>Path</h4>', fields_table(ep["params"])]
    if ep.get("query"): parts += ['<h4>Query</h4>', fields_table(ep["query"])]
    if ep.get("body"): parts += ['<h4>Body</h4>', fields_table(ep["body"])]
    if ep.get("resp"): parts += ['<h4>Response <span class="ok">200</span></h4>', fields_table(ep["resp"], False)]
    if ep.get("errors"):
        parts += ['<h4>Errors</h4>', table(["Status","Code","When"], [[f'<span class="st">{s}</span>', f"<code>{c}</code>", md(w)] for s,c,w in ep["errors"]], "errs")]
    if ep.get("notes"):
        parts.append('<ul class="notes">' + "".join(f"<li>{md(n)}</li>" for n in ep["notes"]) + "</ul>")
    ex = []
    if ep.get("example_req"): ex.append(f'<div class="ex"><span class="ex-l">Request</span><pre><code>{E(ep["example_req"])}</code></pre></div>')
    if ep.get("example_resp"): ex.append(f'<div class="ex"><span class="ex-l">Response</span><pre><code>{E(ep["example_resp"])}</code></pre></div>')
    if ex: parts.append(f'<details class="exs"><summary>Example</summary>{"".join(ex)}</details>')
    parts.append("</article>")
    return "".join(parts)

index_rows = []
for ep in ENDPOINTS:
    flags = []
    if ep.get("coins"): flags.append('<span class="dot dot-coin" title="Moves coins">coins</span>')
    if ep.get("decide"): flags.append('<span class="dot dot-decide" title="Has an open question">open</span>')
    index_rows.append(f'<tr data-q="{E((ep["method"]+" "+ep["path"]+" "+ep["summary"]+" "+ep["group"]).lower())}"><td>{badge(ep["method"])}</td><td><a href="#{slug(ep)}"><code>{E(ep["path"])}</code></a></td><td>{md(ep["summary"])}</td><td class="grp">{E(ep["group"])}</td><td class="flags">{"".join(flags)}</td></tr>')
index_rows.append('<tr data-q="ws realtime websocket"><td><span class="m m-ws">WS</span></td><td><a href="#realtime"><code>/v1/realtime</code></a></td><td>Live match, questions, chat, wallet pushes</td><td class="grp">Realtime</td><td></td></tr>')

n_eps = len(ENDPOINTS)
n_coins = sum(1 for e in ENDPOINTS if e.get("coins"))

sections = []

def sec(id_, title, kicker, body):
    sections.append((id_, title, f'<section id="{id_}" class="sec"><p class="kicker">{kicker}</p><h2>{title}</h2>{body}</section>'))

sec("overview","Overview","What Footon is",
  '<p class="lede">A free-to-play mobile web app. Friends predict football moments together during live matches (“Next corner before 75&apos;?”), set pre-match predictions with a coin stake, and compete in small private leagues called <em>challenges</em>, each on one match.</p>'
  '<h3>Three things that never mix</h3>'
  + table(["","Means","Earned by","Spent on","Shown as"], [[f"<strong>{a}</strong>",b,c,d,e] for a,b,c,d,e in CURRENCIES], "cur") +
  '<p class="note">Coins can never be cashed out or sent to another user. Nothing that earns points is for sale. Every field in this doc maps to something a screen shows today; the source shapes are <code>src/lib/mock-data.ts</code>, <code>economy.ts</code> and <code>predictions.ts</code>.</p>')

sec("conventions","Conventions","How every call behaves",
  table(["Topic","Rule"], [[f"<strong>{a}</strong>", md(b)] for a,b in CONVENTIONS], "kv") +
  '<h3>Error shape</h3><pre><code>' + E(J({"error":{"code":"INSUFFICIENT_COINS","message":"You need 1,050 more coins.","details":{"short":1050}}})) + '</code></pre>'
  '<h3>Error codes the app handles</h3>' +
  table(["Status","Code","details","Where the app shows it"], [[f'<span class="st">{s}</span>', f"<code>{c}</code>", f"<code>{E(d)}</code>", E(w)] for s,c,d,w in ERRORS], "errs"))

sec("index","Endpoint index",f"{n_eps} REST calls + 1 socket",
  '<div class="filter"><label for="ep-filter" class="sr">Filter endpoints</label><input id="ep-filter" type="search" placeholder="Filter: slip, coins, POST, chat…" autocomplete="off"><span id="ep-count" class="count"></span></div>'
  + table(["Method","Path","Purpose","Area",""], [], "idx").replace("<tbody></tbody>", "<tbody>" + "".join(index_rows) + "</tbody>") +
  '<p class="legend"><span class="dot dot-coin">coins</span> moves coins (send an Idempotency-Key) <span class="dot dot-decide">open</span> waits on an open question</p>')

for g in groups:
    eps = [e for e in ENDPOINTS if e["group"] == g]
    extra = ""
    if g == "Matches":
        extra = '<h3>Match page tabs by status</h3>' + table(["Status","Tabs, in order","Fields used"], [[f"<code>{a}</code>",b,f"<code>{c}</code>"] for a,b,c in TABS], "kv")
    if g == "Predictions":
        extra = ('<h3>Markets</h3>' + table(["type","Label","Min stake","Options (value)"], [[f"<code>{a}</code>",b,f'<span class="num">{c}</span>',d] for a,b,c,d in MARKETS]) +
                 '<h3>PUT rules, in order</h3><ol class="steps"><li>Reject after <code>kickoffAt</code>.</li><li>One item per type; pick must be a listed option.</li><li>Stake at least the minimum, or exactly the challenge&apos;s fixed stake.</li><li>Total within the challenge cap.</li><li>Charge (or refund) the difference from the old total. Short → 402 with <code>short</code>.</li><li>Write one CoinEntry per change.</li></ol>')
    if g == "Live questions":
        extra = '<h3>Lifecycle</h3><div class="flow"><span>scheduled</span><span>open</span><span>closed</span><span>resolved / void</span></div><p class="note">About 10 per match, open 30–60s, resolve at a later match minute. Every step is pushed over realtime.</p>'
    sec("g-" + re.sub(r"[^a-z]+","-",g.lower()).strip("-"), g, "Endpoints", extra + "".join(ep_html(e) for e in eps))

sec("realtime","Realtime","One socket, three topics",
  '<pre><code>wss://…/v1/realtime?token=&lt;access&gt;\n\n' + E('{ "op": "subscribe", "topics": ["user", "match:liv-mci", "challenge:ch-1"] }\n{ "op": "resume", "topic": "match:liv-mci", "seq": 1042 }') + '</code></pre>' +
  table(["Topic","Who subscribes","When"], [["<code>user</code>","Always","App open"],["<code>match:{id}</code>","Match page, /play, live rows","While visible"],["<code>challenge:{id}</code>","Challenge page, /play","While visible"]], "kv") +
  '<p class="note">Envelope: <code>{ type, topic, seq, at, data }</code>. <code>seq</code> rises per topic; on reconnect send <code>resume</code> to get missed events, or the server replies <code>resync</code>. Personal fields (yourAnswer, you, pointsAwarded) go only on <code>user</code>. A big match can have tens of thousands of viewers, so fan <code>match:*</code> out from pub/sub.</p>'
  '<h3>Events</h3>' + table(["Type","Topic","data","What the app does"], [[f"<code>{a}</code>", f'<span class="topic t-{b}">{b}</span>', typ(c), E(d)] for a,b,c,d in EVENTS], "evt"))

sec("economy","Economy rules","The server enforces these",
  '<p class="lede">The app mirrors these for instant feedback (disabled buttons, “Need N more coins”). The server decides.</p>' +
  '<div class="rules">' + "".join(f'<div class="rule"><span class="rv">{E(v)}</span><span class="rn">{E(n)}</span><span class="rd">{E(d)}</span><code class="rc">{E(c)}</code></div>' for n,v,d,c in RULES) + '</div>'
  '<h3>Settlement</h3>' + table(["Case","Result","Ledger kind"], [[a,b,f"<code>{c}</code>" if c not in ("—",) else c] for a,b,c in SETTLEMENT], "kv") +
  '<h3>Pool examples</h3>' + table(["Players × entry","Pool","Burned (5%)","Payouts"], [[f'<span class="num">{a}</span>',f'<span class="num">{b}</span>',f'<span class="num">{c}</span>',f'<span class="num">{d}</span>'] for a,b,c,d in POOL_EXAMPLES]) +
  '<h3>Hard rules</h3><ul class="hard">' + "".join(f"<li>{E(h)}</li>" for h in HARD_RULES) + '</ul>'
  '<h3>Starter missions</h3>' + table(["id","Mission","Coins","Completes when"], [[f"<code>{a}</code>",b,f'<span class="num coin">{c}</span>',E(d)] for a,b,c,d in MISSIONS]) +
  '<h3>Ways to earn after week one</h3>' + table(["id","Rule","Detail","Coins","Cap"], [[f"<code>{a}</code>",b,E(c),f'<span class="num coin">{d}</span>',e] for a,b,c,d,e in EARN]))

types_html = ""
for name, desc, fs in TYPES:
    types_html += f'<div class="type" id="t-{name}"><h3><code>{name}</code></h3><p>{md(desc)}</p>{fields_table(fs)}</div>'
sec("types","Data types","Shapes the API returns",
  '<p class="lede">TypeScript names. Click a type anywhere in this page to jump here.</p>' + types_html +
  '<h3 id="t-enums">Enums</h3>' + "".join(f'<span id="t-{n}"></span>' for n,_,_ in ENUMS) +
  table(["Enum","Values","Note"], [[f"<code>{n}</code>", f"<code>{E(v)}</code>", E(no)] for n,v,no in ENUMS], "kv"))

sec("screens","Screen map","Which screen calls what",
  table(["Screen","Route","On load","Actions","Realtime"], [[f"<strong>{a}</strong>",f"<code>{E(b)}</code>",E(c),E(d),E(e)] for a,b,c,d,e in SCREENS], "kv"))

sec("mapping","Mock to API","What changes when we wire it up",
  '<p class="lede">The app will make these changes. The backend doesn&apos;t need to send the old fields.</p>' +
  table(["Mock (mock-data.ts)","API","Why"], [[f"<code>{E(a)}</code>", f"<code>{E(b)}</code>", E(c)] for a,b,c in MAPPING], "kv"))

sec("questions","Open questions",f"{len(QUESTIONS)} decisions before build",
  table(["#","Topic","Question","Proposal","Answer"], [[f'<span class="num">{i+1}</span>',f"<strong>{E(a)}</strong>",E(b),E(c),'<span class="todo">—</span>'] for i,(a,b,c) in enumerate(QUESTIONS)], "qs"))

toc = "".join(f'<li><a href="#{i}">{t}</a></li>' for i,t,_ in sections)
body = "".join(s for _,_,s in sections)

CSS = r"""
/* Layout: sticky contents rail on the left (desktop), one reading column of tables on the right. */
:root{
  --bg:#f6f7f2; --surface:#ffffff; --surface-2:#eef0e7; --line:#e1e4d8; --line-strong:#cdd1c1;
  --fg:#111114; --muted:#55584e; --accent:#4b6a00; --accent-fill:#c8f542; --accent-ink:#0b0f02; --accent-soft:#eaf6c6;
  --live:#8f5400; --live-soft:#fdeccb; --loss:#b42318; --loss-soft:#fde4e1; --info:#2f4f8a; --info-soft:#e3eafa;
  --display:"Barlow Condensed","Arial Narrow",sans-serif; --body:"Geist",ui-sans-serif,system-ui,sans-serif; --mono:"Geist Mono",ui-monospace,SFMono-Regular,Menlo,monospace;
}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){
  --bg:#09090b; --surface:#111114; --surface-2:#18181b; --line:#1e1e23; --line-strong:#2e2e35;
  --fg:#fafafa; --muted:#a1a1aa; --accent:#c8f542; --accent-fill:#c8f542; --accent-ink:#0b0f02; --accent-soft:rgb(200 245 66 / .12);
  --live:#ffb547; --live-soft:rgb(255 181 71 / .13); --loss:#f87171; --loss-soft:rgb(248 113 113 / .13); --info:#9db8f5; --info-soft:rgb(120 150 230 / .14);
  color-scheme:dark}}
:root[data-theme="dark"]{
  --bg:#09090b; --surface:#111114; --surface-2:#18181b; --line:#1e1e23; --line-strong:#2e2e35;
  --fg:#fafafa; --muted:#a1a1aa; --accent:#c8f542; --accent-fill:#c8f542; --accent-ink:#0b0f02; --accent-soft:rgb(200 245 66 / .12);
  --live:#ffb547; --live-soft:rgb(255 181 71 / .13); --loss:#f87171; --loss-soft:rgb(248 113 113 / .13); --info:#9db8f5; --info-soft:rgb(120 150 230 / .14);
  color-scheme:dark}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
@media (prefers-reduced-motion: reduce){html{scroll-behavior:auto}}
body{background:var(--bg);color:var(--fg);font:15px/1.55 var(--body);-webkit-font-smoothing:antialiased}
a{color:inherit}
code{font-family:var(--mono);font-size:.86em}
.wrap{max-width:1240px;margin:0 auto;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:40px 80px;display:grid;grid-template-columns:200px minmax(0,1fr);gap:48px}
@media (max-width:960px){.wrap{grid-template-columns:minmax(0,1fr);gap:24px;padding-block:24px 64px}}
nav.toc{position:sticky;top:calc(24px + env(safe-area-inset-top,0px));align-self:start;font-size:13.5px}
nav.toc p{font:600 11px/1 var(--body);letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin:0 0 12px}
nav.toc ol{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:2px;border-left:1px solid var(--line)}
nav.toc a{display:block;padding:5px 12px;text-decoration:none;color:var(--muted);border-left:2px solid transparent;margin-left:-1px}
nav.toc a:hover{color:var(--fg)}
nav.toc a.on{color:var(--fg);border-left-color:var(--accent);font-weight:600}
@media (max-width:960px){nav.toc{position:static}nav.toc ol{flex-direction:row;flex-wrap:wrap;border:0;gap:6px}nav.toc a{border:1px solid var(--line);border-radius:999px;padding:4px 11px;margin:0}nav.toc a.on{border-color:var(--accent)}}
main{min-width:0}
.hero{padding-bottom:32px;border-bottom:1px solid var(--line);margin-bottom:8px}
.eyebrow{font:600 11px/1 var(--body);letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin:0}
h1{font:700 clamp(40px,7vw,64px)/.95 var(--display);text-transform:uppercase;font-style:italic;margin:12px 0 14px;letter-spacing:0}
h1 span{background:var(--accent-fill);color:var(--accent-ink);padding:0 .14em;border-radius:6px}
.hero p.lede{max-width:64ch}
.stats{display:flex;flex-wrap:wrap;gap:12px 36px;margin-top:22px}
.stat b{display:block;font:700 40px/1 var(--display)}
.stat span{font-size:12.5px;color:var(--muted)}
.sec{padding-top:44px;scroll-margin-top:16px}
.kicker{font:600 11px/1 var(--body);letter-spacing:.08em;text-transform:uppercase;color:var(--accent);margin:0 0 8px}
h2{font:700 30px/1.1 var(--body);letter-spacing:-.03em;margin:0 0 16px;text-wrap:balance}
h3{font:600 16px/1.3 var(--body);margin:28px 0 10px;letter-spacing:-.01em}
h4{font:600 11px/1 var(--body);letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin:18px 0 8px;display:flex;gap:8px;align-items:center}
p{margin:0 0 12px}
.lede{color:var(--muted);max-width:68ch}
.note{color:var(--muted);font-size:13.5px;max-width:76ch;margin-top:12px}
.tw{overflow-x:auto;border:1px solid var(--line);border-radius:14px;background:var(--surface)}
table{border-collapse:collapse;width:100%;font-size:13.5px;font-variant-numeric:tabular-nums}
th{text-align:left;font:600 11px/1.2 var(--body);letter-spacing:.06em;text-transform:uppercase;color:var(--muted);background:var(--surface-2);padding:10px 14px;white-space:nowrap}
td{padding:10px 14px;border-top:1px solid var(--line);vertical-align:top}
td code{white-space:nowrap}
table.fields td:first-child code{color:var(--fg);font-weight:600}
table.fields td:nth-child(2){color:var(--muted)}
table.fields td:nth-child(2), table.fields td:nth-child(2) code{font-family:var(--mono);font-size:12.5px}
table.fields td:last-child{min-width:220px}
table.kv td:first-child{white-space:nowrap}
table.idx td:nth-child(2) a{text-decoration:none}
table.idx td:nth-child(2) a:hover code{text-decoration:underline;text-underline-offset:3px}
table.idx td:nth-child(3){min-width:240px}
table.idx tr[hidden]{display:none}
.grp{color:var(--muted);white-space:nowrap}
.flags{white-space:nowrap}
a.tl{color:var(--info);text-decoration:none}
a.tl:hover{text-decoration:underline}
.m{display:inline-block;font:700 11px/1 var(--mono);padding:5px 7px;border-radius:6px;min-width:52px;text-align:center;letter-spacing:.02em}
.m-get{background:var(--info-soft);color:var(--info)}
.m-post{background:var(--accent-soft);color:var(--accent)}
.m-put{background:var(--live-soft);color:var(--live)}
.m-delete{background:var(--loss-soft);color:var(--loss)}
.m-ws{background:var(--surface-2);color:var(--fg);border:1px solid var(--line-strong)}
.req{font-size:11px;font-weight:600;color:var(--fg)}
.opt{font-size:11px;color:var(--muted)}
.st{font:700 15px/1 var(--display)}
.ok{font:700 13px/1 var(--display);color:var(--accent);letter-spacing:0}
.num{font:700 16px/1 var(--display)}
.coin{color:var(--live)}
.dot{display:inline-block;font:600 10.5px/1 var(--body);padding:4px 7px;border-radius:999px;margin-right:4px}
.dot-coin{background:var(--live-soft);color:var(--live)}
.dot-decide{background:var(--surface-2);color:var(--muted);border:1px dashed var(--line-strong)}
.legend{font-size:12.5px;color:var(--muted);display:flex;gap:6px 14px;flex-wrap:wrap;align-items:center;margin-top:10px}
.filter{display:flex;gap:12px;align-items:center;margin-bottom:12px}
.filter input{flex:1;min-width:0;height:44px;border-radius:12px;border:1px solid var(--line-strong);background:var(--surface);color:var(--fg);padding:0 14px;font:inherit}
.filter input:focus-visible{outline:3px solid color-mix(in srgb,var(--accent) 50%,transparent);outline-offset:1px}
.count{font-size:12.5px;color:var(--muted);white-space:nowrap}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
.ep{border:1px solid var(--line);background:var(--surface);border-radius:18px;padding:18px;margin-top:16px;scroll-margin-top:16px}
.ep .tw{background:var(--bg)}
.ep-h{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.path{font-size:15px;font-weight:600;word-break:break-all}
.ep-sum{margin:10px 0 10px}
.chips{display:flex;flex-wrap:wrap;gap:6px}
.chip{font-size:11.5px;padding:3px 9px;border-radius:999px;border:1px solid var(--line-strong);color:var(--muted);text-decoration:none}
.chip-dim{border-style:dashed}
.chip-coin{border-color:transparent;background:var(--live-soft);color:var(--live);font-weight:600}
.chip-decide{border-style:dashed}
.chip-decide:hover{color:var(--fg)}
.decide{font-size:11px;font-weight:600;padding:1px 7px;border-radius:999px;border:1px dashed var(--line-strong);color:var(--muted)}
ul.notes{margin:14px 0 0;padding-left:18px;color:var(--muted);font-size:13.5px}
ul.notes li{margin:4px 0}
details.exs{margin-top:14px}
details.exs summary{cursor:pointer;font-size:13px;font-weight:600;color:var(--muted);width:max-content}
details.exs summary:hover{color:var(--fg)}
.ex{margin-top:10px}
.ex-l{font:600 11px/1 var(--body);letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
pre{margin:8px 0 0;background:var(--surface-2);border:1px solid var(--line);border-radius:12px;padding:14px;overflow-x:auto;font-size:12.5px;line-height:1.55}
.flow{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.flow span{padding:6px 12px;border-radius:999px;background:var(--surface);border:1px solid var(--line-strong);font-size:13px;font-family:var(--mono)}
.flow span+span::before{content:"→";margin-right:8px;color:var(--muted)}
ol.steps{padding-left:20px;margin:0;font-size:14px}
ol.steps li{margin:4px 0}
.topic{font:600 11px/1 var(--mono);padding:4px 7px;border-radius:6px;background:var(--surface-2)}
.t-user{color:var(--accent)}
.t-match{color:var(--live)}
.t-challenge{color:var(--info)}
.rules{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:1px;background:var(--line);border:1px solid var(--line);border-radius:14px;overflow:hidden}
.rule{background:var(--surface);padding:14px 16px;display:flex;flex-direction:column;gap:3px;min-width:0}
.rv{font:700 30px/1 var(--display)}
.rn{font-weight:600;font-size:14px}
.rd{color:var(--muted);font-size:12.5px}
.rc{color:var(--muted);font-size:11px;margin-top:auto;padding-top:6px}
ul.hard{padding-left:18px;margin:0;max-width:76ch}
ul.hard li{margin:6px 0}
.type{margin-top:26px;scroll-margin-top:16px}
.type h3{margin:0 0 4px}
.type p{color:var(--muted);font-size:13.5px}
.type:target .tw, .ep:target{outline:2px solid var(--accent);outline-offset:2px}
.todo{color:var(--muted)}
table.qs td:nth-child(3){min-width:260px}
"""

JS = r"""
(function(){
  var input=document.getElementById('ep-filter'),count=document.getElementById('ep-count');
  var rows=[].slice.call(document.querySelectorAll('table.idx tbody tr'));
  function run(){var q=(input.value||'').trim().toLowerCase(),n=0;
    rows.forEach(function(r){var on=!q||q.split(/\s+/).every(function(w){return r.dataset.q.indexOf(w)>-1});r.hidden=!on;if(on)n++});
    count.textContent=n+' of '+rows.length;}
  input.addEventListener('input',run);run();
  var links=[].slice.call(document.querySelectorAll('nav.toc a')),map={};
  links.forEach(function(a){map[a.getAttribute('href').slice(1)]=a});
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){links.forEach(function(l){l.classList.remove('on')});var a=map[e.target.id];if(a)a.classList.add('on')}})},{rootMargin:'-10% 0px -80% 0px'});
    document.querySelectorAll('section.sec').forEach(function(s){io.observe(s)});
  }
})();
"""

page = f"""<title>Footon API</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,700;1,700&family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;600;700&display=swap">
<style>{CSS}</style>
<div class="wrap">
<nav class="toc" aria-label="Contents"><p>Contents</p><ol>{toc}</ol></nav>
<main>
<header class="hero">
<p class="eyebrow">Backend handover · v1 proposal · 3 Nov 2026</p>
<h1>Footon <span>API</span></h1>
<p class="lede">What the backend needs to build so the app can swap its mock data for real calls without changing a screen. Written from the frontend as it stands. Items marked <span class="decide">Decide</span> need an answer first.</p>
<div class="stats">
<div class="stat"><b>{n_eps}</b><span>REST endpoints</span></div>
<div class="stat"><b>{len(EVENTS)}</b><span>realtime events</span></div>
<div class="stat"><b>{len(TYPES)}</b><span>data types</span></div>
<div class="stat"><b>{n_coins}</b><span>calls that move coins</span></div>
<div class="stat"><b>{len(QUESTIONS)}</b><span>open questions</span></div>
</div>
</header>
{body}
</main>
</div>
<script>{JS}</script>
"""
open(OUT, "w").write(page)
print("ok", n_eps, len(EVENTS), len(TYPES), n_coins, len(QUESTIONS))
