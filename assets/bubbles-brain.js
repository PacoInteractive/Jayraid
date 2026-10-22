// Bubbles' Gehirn, ganz ohne KI-Dienst: ein Wissensnetz ueber Jayraid.
// Er erkennt, WORUEBER gefragt wird (Golem, Glocke, Taucher …) und WAS man wissen will
// (was ist das, wo, wie besiegen, Belohnung, Tipps, seit wann …), versteht Tippfehler,
// merkt sich das Thema ("und wie besiege ich ihn?") und sucht im Changelog, wenn er
// selbst nichts weiss. Englisch und Deutsch.
(function () {
  "use strict";

  // ── Wissen: jedes Ding im Spiel mit Namen und Antworten je Frageart ──
  // Fragearten: what, where, beat, reward, danger, how, tips, why, count
  var K = {
    golem: {
      names: ["golem", "stone giant", "steinriese", "riese", "~chained", "angekettet", "~boss", "endboss", "final boss"],
      go: "#game",
      en: {
        what: "The golem is a stone giant chained up in old castle ruins. It's the last boss of the story.",
        where: "In old castle ruins. The goals of the story lead you there, and the command /ruine shows you the way to the nearest untouched ruin.",
        beat: "Knock it down with the sabre, then hit it with the golden wand. Only the wand can finish it, so get the wand from a bell first.",
        reward: "Its treasure chest leaps out in an arc and eats its way into the ground. Opening it ends the story, credits included.",
        danger: "Very. It throws divers at you, leaps out of craters and tears holes in the walls. And it has its own boss music, which is never a good sign.",
        tips: "Walk quietly or it wakes up. Bring the sabre AND the golden wand. And don't stand still near the walls.",
        how: "Sneak in quietly, knock it down with the sabre, finish it with the golden wand."
      },
      de: {
        what: "Der Golem ist ein Steinriese, angekettet in alten Burgruinen. Er ist der letzte Boss der Geschichte.",
        where: "In alten Burgruinen. Die Story-Ziele führen dich hin, und der Befehl /ruine zeigt dir den Weg zur nächsten unberührten Ruine.",
        beat: "Wirf ihn mit dem Säbel um, dann triff ihn mit dem goldenen Stab. Nur der Stab kann ihn besiegen, hol dir also zuerst den Stab von einer Glocke.",
        reward: "Seine Schatztruhe springt im Bogen heraus und frisst sich in den Boden. Wer sie öffnet, beendet die Geschichte, mit Abspann.",
        danger: "Sehr. Er wirft Taucher nach dir, springt aus Kratern und reisst Löcher in die Mauern. Und er hat eigene Bossmusik, das ist nie ein gutes Zeichen.",
        tips: "Geh leise, sonst wacht er auf. Nimm Säbel UND goldenen Stab mit. Und bleib nicht an den Mauern stehen.",
        how: "Leise anschleichen, mit dem Säbel umwerfen, mit dem goldenen Stab besiegen."
      }
    },
    bell: {
      names: ["bell", "bell creature", "glocke", "glockenwesen", "ring", "ringing", "läuten", "laeuten"],
      go: "#game",
      en: {
        what: "The bell is a giant creature that waddles around on every trader ship. It guards the golden wand.",
        where: "On every trader ship out on the sea.",
        beat: "Hit it, but watch out: it rings sound waves that hurt, and it crouches and leaps at you. A golden ring shows where it lands, so step out of the ring.",
        reward: "The golden wand. You need it to finish the golem.",
        danger: "Its sound waves hurt exactly as far as you can see them, and its landing breaks through any block.",
        tips: "When it crouches after ringing, look for the golden ring on the ground and get out of it. And think twice: once it's defeated, the traders turn against you.",
        why: "It guards the golden wand, and the traders really like their bell. Beat it and they'll stay angry."
      },
      de: {
        what: "Die Glocke ist ein riesiges Wesen, das auf jedem Händlerschiff herumwatschelt. Sie bewacht den goldenen Stab.",
        where: "Auf jedem Händlerschiff auf dem Meer.",
        beat: "Schlag zu, aber Vorsicht: Sie läutet Schallwellen, die weh tun, und sie duckt sich und springt dich an. Ein goldener Ring zeigt, wo sie landet, also raus aus dem Ring.",
        reward: "Den goldenen Stab. Ohne ihn besiegst du den Golem nicht.",
        danger: "Ihre Schallwellen treffen genau so weit, wie du sie siehst, und ihre Landung durchbricht jeden Block.",
        tips: "Wenn sie sich nach dem Läuten duckt: goldenen Ring am Boden suchen und raus. Und überleg es dir gut, danach sind die Händler gegen dich.",
        why: "Sie bewacht den goldenen Stab, und die Händler hängen an ihrer Glocke. Besiegst du sie, bleiben sie sauer."
      }
    },
    divers: {
      names: ["diver", "divers", "taucher", "~enemy", "~enemies", "gegner", "feind", "feinde", "~camp", "lager", "sabre diver", "archer", "archers", "bogenschuetze", "flyer", "flying diver", "flieger"],
      go: "#game",
      en: {
        what: "The divers are one of the two factions. They live in camps with watchtowers. There are sabre divers, archers, flying divers with fire arrows and rotten divers down in the caves.",
        where: "In their camps and on the watchtowers, up in the hills. The rotten ones live in the caves.",
        beat: "Block with both mouse buttons, then strike back. The sabre thrust knocks them back. Mix up your moves, they learn how you fight.",
        reward: "Sabre divers drop their sabre. That's how you get one, new worlds start empty.",
        danger: "Only if you start it. Since Alpha 1.41 they only attack when you strike first, or during a blood moon raid. At most two attack at the same time.",
        tips: "Don't stand still and just hammer, they punish that with a sprinting stab. Block, step back, strike.",
        why: "They're not evil, just territorial. Leave them alone and they leave you alone. Mostly.",
        how: "They were trained in their own AI training centre and remember how you fight, so they adapt."
      },
      de: {
        what: "Die Taucher sind eine der zwei Fraktionen. Sie leben in Lagern mit Wachtürmen. Es gibt Säbeltaucher, Bogenschützen, fliegende Taucher mit Feuerpfeilen und verrottete Taucher in den Höhlen.",
        where: "In ihren Lagern und auf den Wachtürmen in den Hügeln. Die verrotteten leben in den Höhlen.",
        beat: "Mit beiden Maustasten blocken, dann zurückschlagen. Der Säbelstich stösst sie zurück. Wechsle deine Angriffe ab, sie lernen, wie du kämpfst.",
        reward: "Säbeltaucher lassen ihren Säbel fallen. So kommst du zu einem, neue Welten starten leer.",
        danger: "Nur wenn du anfängst. Seit Alpha 1.41 greifen sie nur an, wenn du zuerst zuschlägst, oder im Blutmond-Überfall. Höchstens zwei greifen gleichzeitig an.",
        tips: "Nicht stehen bleiben und nur draufhauen, das bestrafen sie mit einem Sprint-Stich. Blocken, zurückweichen, zuschlagen.",
        why: "Sie sind nicht böse, nur revierbewusst. Lässt du sie in Ruhe, lassen sie dich in Ruhe. Meistens.",
        how: "Sie wurden in einem eigenen KI-Trainingszentrum trainiert und merken sich, wie du kämpfst."
      }
    },
    rotten: {
      names: ["rotten", "rotten diver", "rotten divers", "verrottet", "verrottete", "zombie", "cave diver"],
      go: "#game",
      en: {
        what: "Rotten divers live deep in the caves and guard the green fires. They drag themselves along and groan.",
        where: "Deep in the caves, near the green fires.",
        beat: "Like other divers: block, then strike. Bring a torch, it's dark down there.",
        reward: "Sometimes one of them stands back up, blue, and becomes your companion."
      },
      de: {
        what: "Verrottete Taucher leben tief in den Höhlen und bewachen die grünen Feuer. Sie schleppen sich dahin und stöhnen.",
        where: "Tief in den Höhlen, bei den grünen Feuern.",
        beat: "Wie andere Taucher: blocken, dann zuschlagen. Nimm eine Fackel mit, da unten ist es dunkel.",
        reward: "Manchmal steht einer blau wieder auf und wird dein Begleiter."
      }
    },
    companion: {
      names: ["companion", "tame a diver", "tame divers", "tame", "zaehmen", "zähmen", "blue", "begleiter", "blau", "blauer", "friend", "freund", "pet", "helper diver"],
      go: "#game",
      en: {
        what: "Sometimes a defeated rotten diver stands back up, blue, and follows you from then on.",
        where: "You get one in the caves, by defeating rotten divers. With a bit of luck.",
        how: "Press E to hand it a sabre. Then it fights at your side.",
        tips: "Give it a sabre as soon as you have a spare one. A companion without a sabre is mostly moral support."
      },
      de: {
        what: "Manchmal steht ein besiegter verrotteter Taucher blau wieder auf und folgt dir von da an.",
        where: "In den Höhlen, wenn du verrottete Taucher besiegst. Mit etwas Glück.",
        how: "Drück E, um ihm einen Säbel zu geben. Dann kämpft er an deiner Seite.",
        tips: "Gib ihm einen Säbel, sobald du einen übrig hast. Ohne Säbel ist er vor allem moralische Unterstützung."
      }
    },
    traders: {
      names: ["trader", "traders", "händler", "haendler", "~ship", "~ships", "schiff", "schiffe", "trade", "trading", "handel", "handeln", "kaufen", "~buy", "~shop"],
      go: "#game",
      en: {
        what: "The traders are the friendly faction. They sail between the islands on their ships and trade with you.",
        where: "Out on the sea, on their ships.",
        how: "Press E next to a trader. Your inventory is on the left, theirs on the right. Drag an offer into the trade field, the cost shows below, and confirm.",
        danger: "Only if you make them angry. Defeat the bell on their ship and they turn against you, and slap you with fish.",
        reward: "Useful things, sometimes even the green cave wand.",
        tips: "Trade with them before you go for the bell. Afterwards they won't like you anymore.",
        why: "The bell on their ship guards the golden wand, and the traders love their bell. Defeat it and they turn against you."
      },
      de: {
        what: "Die Händler sind die freundliche Fraktion. Sie segeln mit ihren Schiffen zwischen den Inseln und handeln mit dir.",
        where: "Draussen auf dem Meer, auf ihren Schiffen.",
        how: "Drück E bei einem Händler. Links dein Inventar, rechts seins. Zieh ein Angebot ins Handelsfeld, darunter stehen die Kosten, dann bestätigen.",
        danger: "Nur wenn du sie verärgerst. Besiegst du die Glocke auf ihrem Schiff, wenden sie sich gegen dich und schlagen dich mit Fischen.",
        reward: "Nützliches, manchmal sogar den grünen Höhlenstab.",
        tips: "Handle mit ihnen, bevor du dir die Glocke vornimmst. Danach mögen sie dich nicht mehr.",
        why: "Die Glocke auf ihrem Schiff bewacht den goldenen Stab, und die Händler lieben ihre Glocke. Besiegst du sie, wenden sie sich gegen dich."
      }
    },
    melvin: {
      names: ["melvin"],
      go: "#game",
      en: { what: "Melvin sits at the top of the watchtowers. Since Alpha 1.41 every tower has him.", where: "At the top of the diver watchtowers." },
      de: { what: "Melvin sitzt oben auf den Wachtürmen. Seit Alpha 1.41 hat jeder Turm einen.", where: "Ganz oben auf den Wachtürmen der Taucher." }
    },
    bloodmoon: {
      names: ["blood moon", "bloodmoon", "blutmond", "red moon", "roter mond", "raid", "raids", "ueberfall", "überfall", "~attack on my base", "~base"],
      go: "#game",
      en: {
        what: "Some nights the moon turns red. Then the divers raid your base, and they bring field cannons.",
        when: "The blood moon came with Alpha 1.41.0 on 20 October 2026.",
        beat: "Build strong walls during the day and be ready when it gets dark. Block, strike back, and watch out for the field cannons.",
        tips: "Build before nightfall, not during. The music starts when a raid comes, that's your warning.",
        danger: "Field cannons don't care about your nice wooden walls. Stone holds better."
      },
      de: {
        what: "In manchen Nächten wird der Mond rot. Dann überfallen die Taucher deine Basis, mit Feldkanonen.",
        when: "Den Blutmond gibt es seit Alpha 1.41.0 vom 20. Oktober 2026.",
        beat: "Bau tagsüber starke Mauern und sei bereit, wenn es dunkel wird. Blocken, zurückschlagen und auf die Feldkanonen achten.",
        tips: "Vor der Nacht bauen, nicht währenddessen. Die Musik setzt ein, wenn ein Überfall kommt, das ist deine Warnung.",
        danger: "Feldkanonen interessieren sich nicht für hübsche Holzwände. Stein hält besser."
      }
    },
    poisonmoon: {
      names: ["poison moon", "giftmond", "acid", "acid rain", "saeureregen", "säureregen", "green moon"],
      go: "#game",
      en: { what: "The poison moon brings acid rain. Better find a roof.", tips: "Stay under a roof while it rains acid." },
      de: { what: "Der Giftmond bringt Säureregen. Such dir besser ein Dach.", tips: "Bleib unter einem Dach, solange es Säure regnet." }
    },
    daynight: {
      names: ["~day", "night", "~tag", "nacht", "daytime", "~dark", "dunkel"],
      en: { what: "Every world has day and night since Alpha 1.41. Nights can bring a blood moon or a poison moon." },
      de: { what: "Seit Alpha 1.41 hat jede Welt Tag und Nacht. Nachts kann ein Blutmond oder ein Giftmond kommen." }
    },
    modes: {
      names: ["mode", "modes", "modus", "modi", "sandbox", "adventure", "challenge", "abenteuer", "herausforderung", "game mode", "spielmodus", "difficulty", "schwierigkeit", "hard"],
      go: "#game",
      en: {
        what: "There are three modes: Sandbox to just build, Adventure with the story, and Challenge with only four lives.",
        count: "Three: Sandbox, Adventure and Challenge.",
        tips: "New to Jayraid? Start with Adventure. Challenge is for when you know what a blood moon feels like."
      },
      de: {
        what: "Es gibt drei Modi: Sandbox zum Bauen, Adventure mit der Geschichte und Challenge mit nur vier Leben.",
        count: "Drei: Sandbox, Adventure und Challenge.",
        tips: "Neu bei Jayraid? Fang mit Adventure an. Challenge ist für alle, die schon wissen, wie sich ein Blutmond anfühlt."
      }
    },
    lives: {
      names: ["~life", "lives", "leben", "~health", "hp", "hearts", "herz", "herzen", "dying", "death", "tod", "sterben", "sterbe"],
      en: {
        what: "You have twelve lives, shown as orange hexagons. Every hit costs exactly one. In Challenge you only get four.",
        count: "Twelve, as hexagons. Four in Challenge mode.",
        how: "When you die, the view tips over and your hand crumbles into hexagons. Dramatic, but you get back up."
      },
      de: {
        what: "Du hast zwölf Leben, als orange Sechsecke. Jeder Treffer kostet genau eins. In Challenge sind es nur vier.",
        count: "Zwölf, als Sechsecke. Im Challenge-Modus vier.",
        how: "Wenn du stirbst, kippt die Sicht und deine Hand zerfällt in Sechsecke. Dramatisch, aber du stehst wieder auf."
      }
    },
    combat: {
      names: ["fight", "fighting", "kampf", "kaempfen", "kämpfen", "block", "blocking", "blocken", "abwehren", "parry", "~attack", "angreifen", "schlagen", "~hit", "~strike", "combat"],
      go: "#controls",
      en: {
        what: "Your fist hits what the crosshair is on. Hold both mouse buttons to block one hit, the bar above the hotbar refills in four seconds.",
        how: "Left click strikes, right click thrusts with the sabre and knocks enemies back. Both buttons together block.",
        tips: "Block first, then strike. Never just stand there and hammer, the divers punish that."
      },
      de: {
        what: "Deine Faust trifft, was im Fadenkreuz ist. Beide Maustasten halten blockt einen Schlag, der Balken über der Leiste lädt in vier Sekunden.",
        how: "Linksklick schlägt, Rechtsklick sticht mit dem Säbel und stösst Gegner zurück. Beide Tasten zusammen blocken.",
        tips: "Erst blocken, dann zuschlagen. Nie stehen bleiben und nur draufhauen, das bestrafen die Taucher."
      }
    },
    sabre: {
      names: ["sabre", "saber", "sword", "säbel", "saebel", "schwert", "weapon", "waffe", "waffen", "weapons"],
      en: {
        what: "The sabre is your main weapon. Its thrust knocks enemies back, and it's the only thing that can knock the golem down.",
        where: "New worlds start empty. You get a sabre by defeating sabre divers.",
        tips: "Hand a spare sabre to your blue companion with E."
      },
      de: {
        what: "Der Säbel ist deine Hauptwaffe. Sein Stich stösst Gegner zurück, und nur er kann den Golem umwerfen.",
        where: "Neue Welten starten leer. Einen Säbel bekommst du, wenn du Säbeltaucher besiegst.",
        tips: "Einen übrigen Säbel gibst du mit E deinem blauen Begleiter."
      }
    },
    goldenwand: {
      names: ["golden wand", "goldener stab", "goldenen stab", "~wand", "~stab", "zauberstab", "magic wand"],
      en: {
        what: "The golden wand is a magic wand guarded by the bell on every trader ship. It's the only thing that can finish the golem. Key R.",
        where: "On the trader ships, guarded by the bell."
      },
      de: {
        what: "Der goldene Stab ist ein Zauberstab, den die Glocke auf jedem Händlerschiff bewacht. Nur er kann den Golem besiegen. Taste R.",
        where: "Auf den Händlerschiffen, bewacht von der Glocke."
      }
    },
    greenwand: {
      names: ["green wand", "cave wand", "gruener stab", "grüner stab", "gruene stab", "gruenen stab", "green stick", "hoehlenstab", "höhlenstab"],
      en: { what: "The green cave wand shows you the way to the green fires in the caves. Key C.", where: "Sometimes the traders have one." },
      de: { what: "Der grüne Höhlenstab zeigt dir den Weg zu den grünen Feuern in den Höhlen. Taste C.", where: "Manchmal haben die Händler einen." }
    },
    caves: {
      names: ["cave", "caves", "hoehle", "höhle", "hoehlen", "höhlen", "green fire", "green fires", "gruenes feuer", "grünes feuer", "underground", "unterirdisch"],
      go: "#game",
      en: {
        what: "Deep inside the mountains burn green fires, guarded by rotten divers. It's dark down there.",
        where: "Inside the mountains. Look for cave entrances on the slopes, the green cave wand shows the way.",
        tips: "Take a torch (key T). And keep an eye out for a rotten diver that turns blue."
      },
      de: {
        what: "Tief in den Bergen brennen grüne Feuer, bewacht von verrotteten Tauchern. Da unten ist es dunkel.",
        where: "In den Bergen. Such Höhleneingänge an den Hängen, der grüne Höhlenstab zeigt den Weg.",
        tips: "Nimm eine Fackel mit (Taste T). Und achte auf einen verrotteten Taucher, der blau wird."
      }
    },
    fire: {
      names: ["fire", "feuer", "burn", "burning", "brennen", "brand", "flame", "flammen", "extinguish", "loeschen", "löschen"],
      en: {
        what: "Wood, planks, leaves and grass catch fire, from a burning player, fire arrows or cannonballs. Fire spreads and chars the blocks.",
        how: "Water and rain put it out. Jumping into the sea works for you too.",
        tips: "Don't build your whole base out of wood if flying divers with fire arrows are around."
      },
      de: {
        what: "Holz, Bretter, Laub und Gras fangen Feuer, durch brennende Spieler, Feuerpfeile oder Kanonenkugeln. Feuer breitet sich aus und verkohlt die Blöcke.",
        how: "Wasser und Regen löschen es. Für dich selbst hilft ein Sprung ins Meer.",
        tips: "Bau nicht die ganze Basis aus Holz, wenn fliegende Taucher mit Feuerpfeilen in der Nähe sind."
      }
    },
    torch: {
      names: ["torch", "fackel", "~light", "licht"],
      go: "#controls",
      en: { what: "The torch lights up dark caves. Key T.", how: "Hold the right mouse button to aim, release to throw. It sticks in the ground, keeps burning and can set things on fire. Walk over it to pick it up." },
      de: { what: "Die Fackel erhellt dunkle Höhlen. Taste T.", how: "Rechte Maustaste halten zum Zielen, loslassen zum Werfen. Sie steckt im Boden, brennt weiter und kann Dinge anzünden. Drüberlaufen zum Aufheben." }
    },
    building: {
      names: ["build", "building", "bauen", "baue", "~place", "platzieren", "~mine", "mining", "abbauen", "~dig", "graben", "~block", "~blocks", "bloecke", "blöcke", "throw block", "werfen"],
      go: "#controls",
      en: {
        what: "Every block can be mined and placed. Mining takes time: dirt two seconds, sand and gravel three, stone four.",
        how: "Left click to mine, right click to place. Q plus right click throws the block in your hand in an arc, and it sets itself where it lands.",
        tips: "Snow, sand and dry gravel crumble when nothing holds them up. Build on stone."
      },
      de: {
        what: "Jeder Block kann abgebaut und gesetzt werden. Abbauen dauert: Erde zwei Sekunden, Sand und Kies drei, Stein vier.",
        how: "Linksklick zum Abbauen, Rechtsklick zum Setzen. Q plus Rechtsklick wirft den Block in deiner Hand im Bogen, er setzt sich dort, wo er landet.",
        tips: "Schnee, Sand und trockener Kies rieseln, wenn nichts sie hält. Bau auf Stein."
      }
    },
    inventory: {
      names: ["inventory", "inventar", "backpack", "rucksack", "hotbar", "slot", "slots", "items", "gegenstaende", "gegenstände"],
      go: "#controls",
      en: { what: "Press I for the inventory: 48 slots, drag anything anywhere. 1 to 0 or the mouse wheel pick a hotbar slot.", count: "48 slots." },
      de: { what: "Mit I öffnest du das Inventar: 48 Plätze, alles frei verschiebbar. 1 bis 0 oder das Mausrad wählen einen Platz in der Leiste.", count: "48 Plätze." }
    },
    cannons: {
      names: ["cannon", "cannons", "kanone", "kanonen", "howitzer", "haubitze", "mortar", "moerser", "mörser", "artillery", "gun", "guns"],
      en: { what: "Ships and towers have cannons, a mortar and a howitzer, and they shell each other. You can man the howitzer yourself with right click.", how: "Walk up to the howitzer and right click to man it." },
      de: { what: "Schiffe und Türme haben Kanonen, einen Mörser und eine Haubitze und beschiessen sich gegenseitig. Die Haubitze kannst du mit Rechtsklick selbst bedienen.", how: "Geh zur Haubitze und bediene sie mit Rechtsklick." }
    },
    movement: {
      names: ["swim", "swimming", "schwimmen", "jump", "jumping", "springen", "sprint", "~run", "rennen", "~walk", "laufen", "~climb", "klettern", "~water", "wasser", "~move", "bewegen"],
      go: "#controls",
      en: { what: "WASD to walk, Shift to sprint, Space to jump. Sprint in deep water to swim in the direction you look. Walk into a one block ledge and you step right up.", how: "Swimming: sprint in deep water and look where you want to go." },
      de: { what: "WASD zum Laufen, Shift zum Sprinten, Leertaste zum Springen. Im tiefen Wasser sprinten heisst schwimmen, in Blickrichtung. Gegen eine Stufe von einem Block läufst du einfach hinauf.", how: "Schwimmen: im tiefen Wasser sprinten und dorthin schauen, wo du hinwillst." }
    },
    controls: {
      names: ["controls", "control", "keys", "~key", "keyboard", "tasten", "taste", "steuerung", "tastatur", "~button", "~buttons", "mouse", "maus", "shortcut"],
      go: "#controls",
      en: { what: "WASD walk, Space jump, left click mine and strike, right click place and thrust, both mouse buttons block. I inventory, E trade, T torch, R golden wand, C cave wand, Y story goals. All keys are listed on this page." },
      de: { what: "WASD laufen, Leertaste springen, Linksklick abbauen und schlagen, Rechtsklick setzen und stechen, beide Maustasten blocken. I Inventar, E handeln, T Fackel, R goldener Stab, C Höhlenstab, Y Story-Ziele. Alle Tasten stehen auf dieser Seite." }
    },
    story: {
      names: ["story", "geschichte", "goal", "goals", "ziel", "ziele", "quest", "quests", "~ending", "~ende", "~finish", "durchspielen", "what to do", "was soll ich tun", "bored", "langweilig", "~mission"],
      go: "#game",
      en: {
        what: "Jayraid is a sandbox first, but there's a story with two bosses and a real ending: from the first watchtower to the chained golem.",
        how: "The first time you enter a world, the game asks if you want the story. Goals then show top right with an arrow, the distance and a golden beam. Y switches them on or off.",
        count: "Two bosses: the bell and the golem. And one ending."
      },
      de: {
        what: "Jayraid ist zuerst eine Sandbox, aber es gibt eine Geschichte mit zwei Bossen und einem echten Ende: vom ersten Wachturm bis zum angeketteten Golem.",
        how: "Beim ersten Betreten einer Welt fragt das Spiel, ob du der Geschichte folgen willst. Die Ziele stehen dann oben rechts mit Pfeil, Entfernung und goldenem Strahl. Y schaltet sie ein und aus.",
        count: "Zwei Bosse: die Glocke und der Golem. Und ein Ende."
      }
    },
    world: {
      names: ["world", "welt", "~map", "karte", "seed", "~island", "~islands", "insel", "inseln", "hexagon", "hexagons", "sechseck", "sechsecke", "river", "rivers", "fluss", "fluesse", "mountain", "mountains", "berg", "berge", "endless", "endlos", "biome", "~snow", "schnee", "weather", "wetter", "~rain", "regen"],
      go: "#game",
      en: {
        what: "Every world comes from a seed and never ends: islands of hexagon pillars, mountains, rivers, forests, caves and the sea. Grass has climate zones up to snow, and there's rain and weather.",
        how: "Brooks spring from the hillsides and great rivers carve deep valleys down to the sea.",
        count: "Endless. Every world goes on as far as you walk."
      },
      de: {
        what: "Jede Welt entsteht aus einem Seed und endet nie: Inseln aus Sechsecksäulen, Berge, Flüsse, Wälder, Höhlen und das Meer. Gras hat Klimazonen bis zum Schnee, und es gibt Regen und Wetter.",
        how: "Bäche entspringen an den Hängen, grosse Flüsse graben tiefe Täler bis zum Meer.",
        count: "Endlos. Jede Welt geht so weit, wie du läufst."
      }
    },
    workshop: {
      names: ["pixel workshop", "workshop", "pixelwerkstatt", "werkstatt", "skin", "skins", "~draw", "zeichnen", "~custom", "~eigene"],
      en: { what: "In the pixel workshop you draw the sabre, the torch, the wands and even the fish yourself, with an eyedropper, and put them straight into the game." },
      de: { what: "In der Pixelwerkstatt pixelst du Säbel, Fackel, Stäbe und sogar den Fisch selbst, mit Pipette, und bringst sie direkt ins Spiel." }
    },
    graphics: {
      names: ["graphics", "grafik", "shadow", "shadows", "schatten", "bloom", "~settings", "einstellungen", "fps", "performance", "~lag", "ruckeln", "sharpening"],
      en: { what: "Jayraid has shadows, bloom, ambient occlusion and a sharpening filter. You find them in the settings under Light and graphics.", tips: "If it stutters, turn off shadows and bloom under Light in the settings." },
      de: { what: "Jayraid hat Schatten, Bloom, Ambient Occlusion und einen Schärfefilter. Du findest sie in den Einstellungen unter Licht und Grafik.", tips: "Wenn es ruckelt, schalte Schatten und Bloom unter Licht in den Einstellungen aus." }
    },
    music: {
      names: ["music", "musik", "~sound", "sounds", "audio", "song", "songs", "~ton"],
      en: { what: "Music only plays during raids now, and the golem has its own deep boss music. All sounds were made deeper and punchier in 1.41. The game brings its own audio, so it works without installing anything." },
      de: { what: "Musik läuft nur noch bei Überfällen, und der Golem hat eigene tiefe Bossmusik. Alle Klänge wurden in 1.41 tiefer und kräftiger. Das Spiel bringt seinen Ton selbst mit, du musst nichts installieren." }
    },
    language: {
      names: ["german", "deutsch", "english", "englisch", "language", "sprache", "translate", "uebersetzen"],
      en: { what: "Jayraid speaks English and German. Switch the language in the game or in the launcher. And I speak both too." },
      de: { what: "Jayraid kann Deutsch und Englisch. Umstellen kannst du im Spiel oder im Launcher. Und ich kann auch beides." }
    },
    join: {
      names: ["join", "tester", "testers", "~place", "~places", "platz", "plaetze", "plätze", "~code", "claim", "mitmachen", "teilnehmen", "~beta", "~alpha", "~access", "zugang", "sign up", "anmelden", "invite", "einladung"],
      go: "#play",
      en: {
        what: "Jayraid is in a closed alpha with 20 tester places. Click CLAIM A PLACE at the top: you get a personal code file and the launcher.",
        how: "Click CLAIM A PLACE, unpack the launcher, start it and type in your code. Keep the code to yourself.",
        count: "20 places in total.",
        why: "Testers get every version first. In return, Jaylen wants to know what works and what doesn't."
      },
      de: {
        what: "Jayraid ist in einer geschlossenen Alpha mit 20 Tester-Plätzen. Klick oben auf CLAIM A PLACE: Du bekommst eine persönliche Code-Datei und den Launcher.",
        how: "Auf CLAIM A PLACE klicken, Launcher entpacken, starten und Code eingeben. Behalte den Code für dich.",
        count: "Insgesamt 20 Plätze.",
        why: "Tester bekommen jede Version zuerst. Dafür will Jaylen wissen, was funktioniert und was nicht."
      }
    },
    install: {
      names: ["install", "installation", "installieren", "~setup", ".net", "net 8", "dotnet", "runtime", "unzip", "entpacken", "requirements", "anforderungen", "~system", "~pc", "~computer", "~laptop", "specs"],
      go: "#install",
      en: {
        what: "You need Windows 10 or 11 and the free .NET 8 Desktop Runtime (x64), installed once. Then unpack the launcher into its own folder.",
        how: "Install .NET 8 Desktop Runtime, unpack the zip into a folder, start Jayraid-Launcher.exe, enter your code, then INSTALL and PLAY.",
        tips: "Choose \"Desktop Runtime\" for Windows x64 on the Microsoft page, not the plain runtime."
      },
      de: {
        what: "Du brauchst Windows 10 oder 11 und die kostenlose .NET 8 Desktop Runtime (x64), einmal installiert. Dann den Launcher in einen eigenen Ordner entpacken.",
        how: ".NET 8 Desktop Runtime installieren, Zip in einen Ordner entpacken, Jayraid-Launcher.exe starten, Code eingeben, dann INSTALL und PLAY.",
        tips: "Wähle auf der Microsoft-Seite \"Desktop Runtime\" für Windows x64, nicht die normale Runtime."
      }
    },
    warning: {
      names: ["warning", "warns", "warnung", "warnt", "smartscreen", "virus", "viren", "malware", "~safe", "~sicher", "~trust", "vertrauen", "~blocked", "blockiert", "run anyway", "defender"],
      go: "#install",
      en: {
        what: "Windows warns about every small program it doesn't know yet. Click More info, then Run anyway.",
        why: "Big studios pay for a signing certificate that Windows knows. Small games don't have one yet, so Windows is careful.",
        how: "The launcher checks every single file against a signed version list before each start and refuses anything that was changed. Only download it from this page."
      },
      de: {
        what: "Windows warnt bei jedem kleinen Programm, das es noch nicht kennt. Klick auf Weitere Informationen, dann Trotzdem ausführen.",
        why: "Grosse Studios bezahlen ein Signatur-Zertifikat, das Windows kennt. Kleine Spiele haben noch keins, deshalb ist Windows vorsichtig.",
        how: "Der Launcher prüft vor jedem Start jede Datei gegen eine signierte Versionsliste und verweigert alles, was verändert wurde. Lade ihn nur von dieser Seite."
      }
    },
    launcher: {
      names: ["launcher", "update", "updates", "aktualisieren", "patch", "patches", "~download", "herunterladen", "~exe"],
      go: "#install",
      en: {
        what: "The Jayraid Launcher installs the game, keeps it up to date and checks every file before it starts.",
        how: "When there's a new version, the big button turns into UPDATE. One click and you're done. The launcher updates itself the same way."
      },
      de: {
        what: "Der Jayraid Launcher installiert das Spiel, hält es aktuell und prüft jede Datei vor dem Start.",
        how: "Gibt es eine neue Version, wird der grosse Knopf zu UPDATE. Ein Klick und fertig. Der Launcher aktualisiert sich selbst genauso."
      }
    },
    platforms: {
      names: ["mac", "macos", "linux", "apple", "phone", "handy", "mobile", "android", "iphone", "ipad", "tablet", "~console", "konsole", "playstation", "xbox", "~switch", "~steam", "~browser", "preview", "vorschau", "itch"],
      en: { what: "The launcher is Windows only for now. On Mac, Linux or a phone you can play the browser preview: one island, no download.", why: "The full game runs on Windows for now. Anything about other platforms isn't decided, as far as I know." },
      de: { what: "Der Launcher läuft vorerst nur unter Windows. Auf Mac, Linux oder dem Handy geht die Browser-Vorschau: eine Insel, kein Download.", why: "Das volle Spiel läuft vorerst unter Windows. Über andere Plattformen ist meines Wissens nichts entschieden." }
    },
    price: {
      names: ["price", "cost", "costs", "~free", "~pay", "~money", "~buy", "preis", "kostet", "kosten", "gratis", "kostenlos", "bezahlen", "geld", "euro", "dollar"],
      en: { what: "Testing the alpha is free. You just need one of the 20 tester places. Anything about a later price isn't decided, as far as I know." },
      de: { what: "Die Alpha zu testen ist kostenlos. Du brauchst nur einen der 20 Tester-Plätze. Über einen späteren Preis ist meines Wissens nichts entschieden." }
    },
    dev: {
      names: ["developer", "~dev", "jaylen", "paco", "paco interactive", "who made", "wer hat", "entwickler", "made by", "creator", "ersteller", "~team", "~studio", "~engine", "unity", "unreal", "c#", "programmiert", "programmed"],
      en: {
        what: "Jayraid is made by Jaylen (Paco Interactive). The first C# version came out on 20 September 2026, and more than 50 versions followed within a month.",
        how: "It's written in C# with its own engine, not Unity or Unreal. Even the font is made of hexagons."
      },
      de: {
        what: "Jayraid wird von Jaylen (Paco Interactive) gemacht. Die erste C#-Version kam am 20. September 2026, und in einem Monat folgten über 50 Versionen.",
        how: "Es ist in C# geschrieben, mit eigener Engine, nicht Unity oder Unreal. Sogar die Schrift besteht aus Sechsecken."
      }
    },
    minecraft: {
      names: ["minecraft", "clone", "klon", "copy", "kopie", "like minecraft", "wie minecraft", "terraria", "notch"],
      en: { what: "Jayraid is built from hexagon pillars, not cubes. It has two factions that fight each other, trader ships, divers that learn how you fight, bosses and a real ending. Different water, different game." },
      de: { what: "Jayraid besteht aus Sechsecksäulen, nicht aus Würfeln. Es hat zwei Fraktionen, die sich bekämpfen, Händlerschiffe, Taucher, die lernen, wie du kämpfst, Bosse und ein echtes Ende. Anderes Wasser, anderes Spiel." }
    },
    multiplayer: {
      names: ["multiplayer", "~online", "friends", "freunde", "coop", "co-op", "~together", "~zusammen", "~server", "lan"],
      en: { what: "As far as I know Jayraid is single player for now. Nothing in the changelog talks about multiplayer yet." },
      de: { what: "Soweit ich weiss, ist Jayraid vorerst ein Einzelspieler-Spiel. Im Changelog steht noch nichts von Mehrspieler." }
    },
    commands: {
      names: ["command", "commands", "befehl", "befehle", "cheat", "cheats", "/ruine", "console command"],
      en: { what: "There's a command field. /ruine leads you to the nearest untouched ruin, /ruine neu resets a ruin after a fight." },
      de: { what: "Es gibt ein Befehlsfeld. /ruine führt zur nächsten unberührten Ruine, /ruine neu setzt eine Ruine nach einem Kampf zurück." }
    },
    jayraid: {
      names: ["jayraid", "the game", "this game", "das spiel", "dieses spiel", "worum geht", "what kind of game", "was fuer ein spiel", "genre", "about the game"],
      go: "#game",
      en: {
        what: "Jayraid is a sandbox adventure in an endless world made of hexagon pillars. Build and explore freely, or follow the story: the divers, the trader ships, the bell and the chained golem.",
        how: "Three modes: Sandbox, Adventure and Challenge. Day and night, blood moon raids on your base, and a story with an ending.",
        why: "Because cubes were taken. Blub."
      },
      de: {
        what: "Jayraid ist ein Sandbox-Abenteuer in einer endlosen Welt aus Sechsecksäulen. Frei bauen und erkunden, oder der Geschichte folgen: die Taucher, die Händlerschiffe, die Glocke und der angekettete Golem.",
        how: "Drei Modi: Sandbox, Adventure und Challenge. Tag und Nacht, Blutmond-Überfälle auf deine Basis und eine Geschichte mit Ende.",
        why: "Weil Würfel schon vergeben waren. Blub."
      }
    },
    bubbles: {
      names: ["bubbles", "you", "du", "dich", "dir", "yourself", "mascot", "maskottchen"],
      en: { what: "I'm Bubbles, a diver. One of the friendly ones. I live in the corner of this page and know a lot about Jayraid. I'm not a big AI, just a well-read diver." },
      de: { what: "Ich bin Bubbles, ein Taucher. Einer von den netten. Ich wohne in der Ecke dieser Seite und weiss viel über Jayraid. Ich bin keine grosse KI, nur ein belesener Taucher." }
    }
  };

  var FACTS = [
    ["The divers trained in their own AI training centre before they ever met a player. They remember how you fight.", "Die Taucher wurden in einem eigenen KI-Trainingszentrum trainiert. Sie merken sich, wie du kämpfst."],
    ["A thrown block lands in exactly the same spot at any frame rate. That was built for speedruns.", "Ein geworfener Block landet bei jeder Bildrate genau gleich. Das ist für Speedruns gemacht."],
    ["The bell's sound wave hurts exactly as far as you can see it. Not one block further.", "Die Schallwelle der Glocke trifft genau so weit, wie du sie siehst. Keinen Block weiter."],
    ["Lives used to be half hearts. Since Alpha 1.30 you have twelve whole hexagons, and every hit costs exactly one.", "Früher gab es halbe Herzen. Seit Alpha 1.30 hast du zwölf ganze Sechsecke, jeder Treffer kostet genau eins."],
    ["The golem only falls to the sabre and only dies to the golden wand. Bring both.", "Der Golem fällt nur durch den Säbel und stirbt nur durch den goldenen Stab. Nimm beides mit."],
    ["Every block in Jayraid has 16 variants, so no wall looks copy-pasted.", "Jeder Block hat 16 Varianten, deshalb sieht keine Wand kopiert aus."],
    ["Melvin sits at the top of every watchtower. Say hi. From a distance.", "Melvin sitzt oben auf jedem Wachturm. Sag hallo. Aus sicherer Entfernung."],
    ["The traders put out burning ships with snow. Where they get it from on the open sea is their secret.", "Die Händler löschen brennende Schiffe mit Schnee. Woher sie den auf hoher See haben, bleibt ihr Geheimnis."],
    ["In the pixel workshop you can redraw the sabre, the torch, the wands and even the fish, with an eyedropper.", "In der Pixelwerkstatt pixelst du Säbel, Fackel, Stäbe und sogar den Fisch selbst, mit Pipette."],
    ["The first C# version of Jayraid came out on 20 September 2026. More than 50 versions followed in a month.", "Die erste C#-Version von Jayraid kam am 20. September 2026. In einem Monat folgten über 50 Versionen."],
    ["Gravel by the water turns into wet gravel. Dry gravel, sand and snow crumble when nothing holds them.", "Kies am Wasser wird zu nassem Kies. Trockener Kies, Sand und Schnee rieseln, wenn nichts sie hält."],
    ["The golem's treasure chest leaps out in an arc and eats its way into the ground. Dramatic, I know.", "Die Schatztruhe des Golems springt im Bogen heraus und frisst sich in den Boden. Dramatisch, ich weiss."],
    ["Sometimes a defeated rotten diver stands back up, blue, and follows you. Give it a sabre and it fights with you.", "Manchmal steht ein besiegter verrotteter Taucher blau wieder auf und folgt dir. Gib ihm einen Säbel."],
    ["The game speaks German too. You can switch the language in the game or in the launcher.", "Das Spiel kann auch Deutsch. Umstellen kannst du im Spiel oder im Launcher."],
    ["Every launcher checks every single file against a signed list before the game starts. Changed files don't run.", "Der Launcher prüft vor jedem Start jede Datei gegen eine signierte Liste. Veränderte Dateien starten nicht."],
    ["Angry traders slap you with fish. The fish is made of hexagon pixels, which doesn't make it hurt less.", "Wütende Händler schlagen dich mit Fischen. Die sind aus Sechseck-Pixeln, wehtun tut es trotzdem."],
    ["Standing still and hammering at a diver is a bad idea. They answer with a sprinting stab.", "Stehen bleiben und auf einen Taucher einhämmern ist keine gute Idee. Er antwortet mit einem Sprint-Stich."],
    ["Even the font on this page is made of hexagons, just like the one in the launcher.", "Sogar die Schrift auf dieser Seite besteht aus Sechsecken, genau wie im Launcher."]
  ];

  // ── Gespraech: Smalltalk, kommt vor dem Wissen ────────────────────
  var TALK = [
    { re: /^(hi|hello|hey|hallo|servus|gruezi|gruessgott|moin|yo|hoi|sali|guten tag|good morning|guten morgen|na)\b/, short: true,
      en: ["Hi! I'm Bubbles. Ask me anything about Jayraid.", "Hey there! Blub. What do you want to know?", "Hello! Looking for the golem or just saying hi?"],
      de: ["Hallo! Ich bin Bubbles. Frag mich alles über Jayraid.", "Hey! Blub. Was willst du wissen?", "Hallo! Suchst du den Golem oder sagst du nur hallo?"] },
    { re: /(how are you|how r u|hows it going|how do you do|wie gehts|wie geht es dir|wie gehts dir|alles gut|alles klar bei dir)/,
      en: ["Wet, as always. But happy! What can I do for you?", "Great, the water is nice today. And you?"],
      de: ["Nass, wie immer. Aber gut gelaunt! Was kann ich für dich tun?", "Super, das Wasser ist heute angenehm. Und dir?"] },
    { re: /(what can you do|what do you know|can you help|help me|hilf mir|was kannst du|was weisst du|kannst du mir helfen|commands|hilfe$|^help$)/,
      en: ["I know Jayraid inside out: the bosses, the divers, the traders, the controls, how to join and install, and what's new. Just ask, in English or German. I also have fun facts."],
      de: ["Ich kenne Jayraid in- und auswendig: die Bosse, die Taucher, die Händler, die Steuerung, wie man mitmacht und installiert, und was neu ist. Frag einfach, auf Deutsch oder Englisch. Fakten habe ich auch."] },
    { re: /(are you (an |a )?(ai|bot|robot|human|real)|bist du (eine |ein )?(ki|bot|roboter|mensch|echt)|chatgpt|claude)/,
      en: ["I'm a small diver bot that lives on this page. No big AI, no internet brain, just a lot of knowledge about Jayraid."],
      de: ["Ich bin ein kleiner Taucher-Bot, der auf dieser Seite wohnt. Keine grosse KI, kein Internet-Gehirn, nur viel Wissen über Jayraid."] },
    { re: /(how old|wie alt|birthday|geburtstag)/,
      en: ["I hatched together with this website in October 2026. The game itself is a bit older: the first C# version came out on 20 September 2026."],
      de: ["Ich bin im Oktober 2026 mit dieser Website geschlüpft. Das Spiel ist etwas älter: Die erste C#-Version kam am 20. September 2026."] },
    { re: /(joke|witz|make me laugh|bring mich zum lachen|something funny|was lustiges)/,
      en: ["Why don't divers ever get lonely? Because they always stick in groups of two. That's the maximum that attacks at once. Blub.", "What did the bell say to the golem? Nothing, it just rang. Twice. Painfully.", "I told a trader a joke once. He slapped me with a fish. Tough crowd."],
      de: ["Warum sind Taucher nie allein? Weil höchstens zwei gleichzeitig angreifen. Der Rest wartet in der Schlange. Blub.", "Was sagt die Glocke zum Golem? Nichts, sie läutet nur. Zweimal. Schmerzhaft.", "Ich hab einem Händler mal einen Witz erzählt. Er hat mich mit einem Fisch geschlagen. Hartes Publikum."] },
    { re: /(you are (cute|great|awesome|cool|sweet|nice|the best)|youre (cute|great|awesome|cool)|du bist (suess|toll|cool|super|der beste|nett|lieb)|i love you|ich liebe dich|good bot|guter bot)/,
      en: ["Aww, blub! My visor is turning even more orange.", "Thank you! I'll tell the other divers. They won't believe it."],
      de: ["Oh, blub! Mein Visier wird noch oranger.", "Danke! Das erzähl ich den anderen Tauchern. Die werden es nicht glauben."] },
    { re: /(stupid|dumb|idiot|useless|you suck|dumm|bloed|nutzlos|doof|scheiss)/,
      en: ["Ouch. I'm only a small diver, but I'm trying. Ask me something about Jayraid and I'll prove it."],
      de: ["Autsch. Ich bin nur ein kleiner Taucher, aber ich geb mir Mühe. Frag mich etwas über Jayraid, dann beweise ich es."] },
    { re: /(meaning of life|sinn des lebens)/,
      en: ["42. Or twelve, if you count lives in hexagons."], de: ["42. Oder zwölf, wenn du Leben in Sechsecken zählst."] },
    { re: /(favou?rite|lieblings)/,
      en: ["My favourite thing in Jayraid? The blood moon. From a safe distance, under water."],
      de: ["Mein Lieblingsding in Jayraid? Der Blutmond. Aus sicherer Entfernung, unter Wasser."] },
    { re: /(thank|thx|ty\b|danke|merci|vielen dank)/,
      en: ["Anytime! Blub.", "You're welcome! Watch out for red moons."],
      de: ["Gern! Blub.", "Gern geschehen! Pass auf bei rotem Mond."] },
    { re: /(bye|goodbye|see you|ciao|tschuess|tschau|bis bald|bis spaeter|adieu|gute nacht|good night)/,
      en: ["Bye! Watch out for red moons.", "See you! I'll be here, floating in the corner."],
      de: ["Tschüss! Pass auf bei rotem Mond.", "Bis bald! Ich bin hier, in meiner Ecke."] }
  ];

  // ── Worte und Sprache ─────────────────────────────────────────────
  function norm(s) {
    return (" " + s + " ").toLowerCase()
      .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
      .replace(/[’'`]/g, " ").replace(/[^a-z0-9#./+ -]/g, " ").replace(/\s+/g, " ").trim();
  }
  var DE_WORDS = /\b(ich|du|wie|was|wo|wer|warum|wieso|wann|kann|ist|und|nicht|der|die|das|ein|eine|mit|fuer|spiel|hallo|danke|bitte|besiege|finde|gibt|es|ihn|man|mein|meine|welche|welcher|sind|bin|hast|habe|auch|noch|schon|oder|aber|seit)\b/g;
  var EN_WORDS = /\b(i|you|how|what|where|who|why|when|can|is|and|not|the|a|an|with|for|game|hello|thanks|please|beat|find|there|it|my|which|are|am|have|also|still|or|but|since|do|does)\b/g;
  function lang(n, fallback) {
    var de = (n.match(DE_WORDS) || []).length, en = (n.match(EN_WORDS) || []).length;
    if (de > en) return "de";
    if (en > de) return "en";
    return fallback || "en";
  }

  function lev(a, b) {
    if (Math.abs(a.length - b.length) > 2) return 9;
    var prev = [], cur, i, j;
    for (j = 0; j <= b.length; j++) prev[j] = j;
    for (i = 1; i <= a.length; i++) {
      cur = [i];
      for (j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
    return prev[b.length];
  }
  // Passt ein Name? Ganze Woerter, Wortanfaenge (golems, tauchern) und kleine Tippfehler.
  // Namen mit ~ sind allgemeine Woerter (run, place, water …) und zaehlen weniger.
  function match(n, toks, name) {
    var w = name.charAt(0) === "~" ? 0.5 : 1, nn = norm(name.replace(/^~/, ""));
    if (nn.indexOf(" ") >= 0) return (" " + n).indexOf(" " + nn) >= 0 ? 3 * w : 0;
    for (var i = 0; i < toks.length; i++) {
      var t = toks[i];
      if (t === nn) return 2 * w;
      if (nn.length >= 4 && t.length > nn.length && t.indexOf(nn) === 0 && t.length - nn.length <= 3) return 1.6 * w;
      if (t.length >= 3 && nn.length - t.length === 1 && nn.indexOf(t) === 0) return 1 * w;
      if (nn.length >= 5 && t.length >= 4 && t[0] === nn[0] && lev(t, nn) <= (nn.length >= 8 ? 2 : 1)) return 1.2 * w;
    }
    return 0;
  }

  // ── Was will man wissen? ──────────────────────────────────────────
  var FACETS = [
    ["when", /\b(when|since when|which version|what version was|added|introduced|wann|seit wann|welche(r|n)? version|eingefuehrt|hinzugefuegt|dazugekommen)\b/],
    ["count", /\b(how many|how much|wie viele|wie viel|anzahl|number of)\b/],
    ["where", /\b(how (do|can) (i|you) get|how to get|where (do|can) i get|wie (bekomme|kriege|bekommt|kriegt) (man|ich)|woher)\b/],
    ["beat", /\b(beat|defeat|kill|destroy|win|survive|stop|deal with|besieg\w*|toet\w*|umbring\w*|schaff\w*|plattmach\w*|ueberleb\w*|gewinn\w*|bekaempf\w*|ausschalt\w*|fertigmach\w*)\b/],
    ["where", /\b(where|find|location|located|get to|wo|wohin|finde\w*|ort|gefunden|zu finden)\b/],
    ["reward", /\b(reward|loot|drop|drops|what do i get|get from|worth it|belohnung|beute|bekomm\w*|krieg\w*|lohnt)\b/],
    ["danger", /\b(danger\w*|hurt|damage|strong|scary|deadly|gefaehr\w*|schaden|stark|weh|toedlich|angst)\b/],
    ["tips", /\b(tip|tips|trick|tricks|advice|hint|strategy|tipp|tipps|rat|ratschlag|strategie|hinweis)\b/],
    ["why", /\b(why|warum|wieso|weshalb|wozu)\b/],
    ["what", /\b(how long|wie lange|dauert|takes)\b/],
    ["how", /\b(how|wie|use|benutz\w*|verwend\w*|work|funktionier\w*)\b/],
    ["what", /\b(what|was ist|was sind|explain|erklaer\w*|tell me about|erzaehl mir|what is|who is|wer ist)\b/]
  ];
  function facet(n) {
    for (var i = 0; i < FACETS.length; i++) if (FACETS[i][1].test(n)) return FACETS[i][0];
    return "";
  }
  var FOLLOW = /\b(it|its|him|her|them|they|that|this|there|those|es|ihn|ihm|ihr|sie|ihnen|den|dem|dort|da|das|dies\w*|der|die)\b/;
  var MORE = /\b(more|tell me more|go on|continue|and\??$|what else|mehr|weiter|erzaehl mehr|noch was|und sonst|details)\b/;

  // ── Changelog als Gedaechtnis ─────────────────────────────────────
  var log = [];
  var STOP = /^(the|and|for|with|you|your|that|this|from|they|them|what|when|where|which|have|does|into|about|there|their|wann|wurde|welche|version|seit|gibt|haben|einen|eine|einer|dass|nicht|auch|noch|oder|aber|sind|wird|kann|game|spiel|added|neu|new|jayraid|alpha|how|wie|was|ist|der|die|das|und|mit|von|fuer|ich|du)$/;
  function setChangelog(md) {
    log = [];
    md.split(/^## /m).slice(1).forEach(function (p) {
      var lines = p.split("\n"), head = lines[0].split("·").map(function (x) { return x.trim(); });
      log.push({ name: head[0], date: head[1] || "", title: head[2] || "", text: lines.slice(1).join(" ").replace(/\s+/g, " ").trim() });
    });
  }
  function sentence(text, words) {
    var parts = text.split(/(?<=[.!?])\s+/);
    for (var i = 0; i < parts.length; i++) {
      var p = norm(parts[i]);
      for (var j = 0; j < words.length; j++) if (p.indexOf(words[j]) >= 0) return parts[i];
    }
    return parts[0];
  }
  // Sucht die Versionen, in denen die Woerter vorkommen. first: die aelteste zuerst.
  function search(words, first) {
    if (!log.length || !words.length) return null;
    var best = null, bestScore = 0;
    var list = first ? log.slice().reverse() : log;
    list.forEach(function (e) {
      var hay = norm(e.title + " " + e.text), s = 0;
      words.forEach(function (w) { if (hay.indexOf(w) >= 0) s += w.length > 5 ? 2 : 1; });
      if (s > bestScore) { bestScore = s; best = e; }
    });
    return best ? { entry: best, words: words } : null;
  }
  function keywords(toks) {
    return toks.filter(function (t) { return t.length >= 4 && !STOP.test(t); });
  }

  // ── Zustand des Gespraechs ────────────────────────────────────────
  var st = { lang: "en", topic: null, told: {}, pending: null, latestEn: "", latestDe: "", places: null };
  var factOrder = FACTS.map(function (f, i) { return i; }).sort(function () { return Math.random() - 0.5; }), factAt = 0;
  function fact(l) { var f = FACTS[factOrder[factAt++ % FACTS.length]]; return l === "de" ? "Fakt: " + f[1] : "Fun fact: " + f[0]; }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  var CHIPS = {
    en: { where: "Where do I find it?", beat: "How do I beat it?", reward: "What do I get?", tips: "Any tips?", how: "How does it work?", danger: "Is it dangerous?", why: "Why?", more: "Tell me more" },
    de: { where: "Wo finde ich das?", beat: "Wie besiege ich das?", reward: "Was bekomme ich?", tips: "Hast du Tipps?", how: "Wie funktioniert das?", danger: "Ist das gefährlich?", why: "Warum?", more: "Erzähl mehr" }
  };
  function chipsFor(id, l) {
    var e = K[id][l], told = st.told[id] || {}, out = [];
    ["beat", "where", "reward", "how", "tips", "danger", "why"].forEach(function (f) { if (e[f] && !told[f] && out.length < 3) out.push(CHIPS[l][f]); });
    return out;
  }

  function about(id, f, l) {
    var e = K[id][l];
    st.told[id] = st.told[id] || {};
    if (f === "more") {
      var order = ["what", "how", "where", "beat", "reward", "tips", "danger", "why", "count"];
      for (var i = 0; i < order.length; i++) if (e[order[i]] && !st.told[id][order[i]]) { f = order[i]; break; }
      if (f === "more") return l === "de" ? "Mehr weiss ich darüber nicht. Frag mich nach etwas anderem, oder willst du einen Fakt?" : "That's all I know about it. Ask me something else, or want a fun fact?";
    }
    if (f === "when" && !e.when) {
      var found = search(K[id].names.map(norm).filter(function (w) { return w.length >= 4; }), true);
      if (found) {
        var x = found.entry;
        return (l === "de" ? "Das kam zum ersten Mal mit " + x.name + " am " + x.date + " („" + x.title + "“): " : "That first came with " + x.name + " on " + x.date + " (\"" + x.title + "\"): ") + sentence(x.text, found.words);
      }
      f = "what";
    }
    if (f === "beat" && !e.beat) f = e.how ? "how" : "what";
    if ((f === "count" || f === "danger" || f === "reward" || f === "why" || f === "tips" || f === "where") && !e[f]) f = "what";
    if (!e[f]) f = "what";
    st.told[id][f] = true;
    return e[f];
  }

  // ── Die Antwort ───────────────────────────────────────────────────
  function reply(text) {
    var n = norm(text), toks = n.split(" "), l = lang(n, st.lang);
    st.lang = l;
    if (!n) return { text: l === "de" ? "Blub?" : "Blub?" };

    // Ja / Nein auf eine Frage von Bubbles
    if (st.pending && /^(yes|yeah|yep|sure|ok|okay|ja|jo|klar|gerne|gern|na klar|why not|warum nicht)\b/.test(n)) {
      var p = st.pending; st.pending = null;
      if (p === "fact") return { text: fact(l), chips: [l === "de" ? "Noch einer" : "Another one"] };
    }
    if (st.pending && /^(no|nope|nah|nein|nee|noe)\b/.test(n)) {
      st.pending = null;
      return { text: l === "de" ? "Okay! Frag einfach, wenn du etwas wissen willst." : "Okay! Just ask if you want to know something." };
    }
    st.pending = null;
    if (/^(another( one)?|one more|noch (einer|eins|ein fakt)|nochmal)\b/.test(n) || /\b(fun ?fact|fact|fakt|did you know|wusstest du|erzaehl (mir )?(was|etwas)|tell me something|surprise me|ueberrasch)/.test(n)) {
      return { text: fact(l), chips: [l === "de" ? "Noch einer" : "Another one"] };
    }

    // Eine bestimmte Version: "what happened in alpha 1.22", "was kam mit 1.38"
    var vm = /\b1\.(\d{1,2})(?:\.(\d))?\b/.exec(n);
    if (vm && log.length) {
      var want = "1." + vm[1] + "." + (vm[2] || "0");
      var hit = log.filter(function (e) { return e.name.indexOf(want) >= 0; })[0];
      if (hit) return { text: (l === "de" ? hit.name + " vom " + hit.date + " („" + hit.title + "“): " : hit.name + " from " + hit.date + " (\"" + hit.title + "\"): ") + hit.text };
      return { text: l === "de" ? "Eine Version " + want + " finde ich nicht. Die neueste ist im Changelog ganz oben." : "I can't find a version " + want + ". The newest one is at the top of the changelog." };
    }

    // Aktuelles: neueste Version, freie Plaetze
    if (/\b(whats? new|what s new|what is new|anything new|was ist neu|news|neuigkeiten|latest|neueste|newest|current version|aktuelle version|last update|letzte(s)? update|changelog)\b/.test(n)) {
      return { text: (l === "de" ? st.latestDe : st.latestEn) || (l === "de" ? "Alles Neue steht im Changelog." : "Everything new is in the changelog."), go: "#news", chips: [l === "de" ? "Was ist der Blutmond?" : "What is the blood moon?"] };
    }
    if (st.places && /\b(left|free|available|noch frei|uebrig|frei|verfuegbar)\b/.test(n) && /\b(place|places|platz|plaetze|spot|spots|tester)\b/.test(n)) {
      var pl = st.places;
      return { text: l === "de" ? "Gerade sind noch " + pl.free + " von " + pl.total + " Plätzen frei. Klick oben auf CLAIM A PLACE." : "Right now " + pl.free + " of " + pl.total + " places are free. Click CLAIM A PLACE at the top.", go: "#play" };
    }

    // Was ist gemeint? Alle Dinge bewerten.
    var scores = [];
    Object.keys(K).forEach(function (id) {
      if (id === "bubbles") return;
      // Mehrere Treffer zaehlen zusammen: "place blocks" ist eher Bauen als Mitmachen.
      var s = 0, best = {};
      K[id].names.forEach(function (name) {
        var m = match(n, toks, name), key = norm(name.replace(/^~/, "")).split(" ")[0].slice(0, 4);
        if (m > (best[key] || 0)) { s += m - (best[key] || 0); best[key] = m; }
      });
      if (s) scores.push([id, s]);
    });
    scores.sort(function (a, b) { return b[1] - a[1]; });
    var f = facet(n), more = MORE.test(n);

    // Smalltalk zuerst, wenn kein Ding aus dem Spiel gemeint ist (oder die Nachricht kurz ist).
    for (var i = 0; i < TALK.length; i++) {
      var t = TALK[i];
      if (t.re.test(n) && (!scores.length || scores[0][1] < 1.5 || (t.short && toks.length <= 2))) {
        return { text: pick(t[l]) };
      }
    }
    if (/\b(who are you|what are you|wer bist du|was bist du|your name|dein name|wie heisst du)\b/.test(n)) {
      return { text: K.bubbles[l].what };
    }

    // Folgefrage ohne neues Thema: "und wie besiege ich ihn?", "erzaehl mehr"
    // Unbekannte Inhaltswoerter ("what is xyz") sind keine Folgefrage.
    var unknown = keywords(toks).filter(function (t) { return !facet(" " + t + " ") && !MORE.test(t); });
    if (!scores.length && st.topic && (more || FOLLOW.test(n) || (!unknown.length && (f || toks.length <= 4)))) {
      return answerAbout([st.topic], more ? "more" : (f || "more"), l);
    }

    if (scores.length) {
      var ids = [scores[0][0]];
      // Zwei Themen in einer Frage ("Glocke und Golem")
      if (scores[1] && scores[1][1] >= scores[0][1] * 0.75 && /\b(and|und|or|oder|vs|versus|gegen|or the|compare|vergleich|unterschied|difference)\b/.test(n)) ids.push(scores[1][0]);
      return answerAbout(ids, more ? "more" : (f || "what"), l);
    }

    // Nichts im Wissen: im Changelog nachsehen.
    var words = keywords(toks), found = search(words, f === "when");
    if (found && words.length) {
      var x = found.entry;
      return { text: (l === "de" ? "Dazu habe ich im Changelog etwas gefunden, " + x.name + " (" + x.date + "): " : "I found this in the changelog, " + x.name + " (" + x.date + "): ") + sentence(x.text, found.words), go: null };
    }

    // Fast getroffen? Nachfragen.
    var near = null;
    toks.forEach(function (t) {
      if (t.length < 4) return;
      Object.keys(K).forEach(function (id) {
        K[id].names.forEach(function (name) {
          var nn = norm(name.replace(/^~/, ""));
          if (t.length >= 5 && nn.length >= 5 && t[0] === nn[0] && lev(t, nn) === 2 && !near) near = [id, name.replace(/^~/, "")];
        });
      });
    });
    if (near) {
      st.topic = near[0];
      return { text: l === "de" ? "Meinst du " + near[1] + "? Dann frag einfach nochmal, ich bin ganz Ohr. Also, Helm." : "Did you mean " + near[1] + "? Ask me again, I'm all ears. Well, helmet." };
    }

    st.pending = "fact";
    return {
      text: l === "de"
        ? pick(["Hm, da bin ich überfragt. Ich bin ein Taucher, kein Lexikon. Frag mich nach den Bossen, den Tauchern, der Installation oder den Tasten. Willst du einen Fakt?", "Das weiss ich leider nicht. Aber über Jayraid weiss ich fast alles. Soll ich dir einen Fakt erzählen?"])
        : pick(["Hm, no idea. I'm a diver, not a library. Ask me about the bosses, the divers, installing or the controls. Want a fun fact?", "I don't know that one. But I know nearly everything about Jayraid. Want a fun fact?"]),
      chips: l === "de" ? ["Ja, ein Fakt", "Wie mache ich mit?", "Was ist neu?"] : ["Yes, a fun fact", "How do I join?", "What's new?"]
    };
  }

  function answerAbout(ids, f, l) {
    var texts = ids.map(function (id) { return about(id, f, l); });
    var id = ids[ids.length - 1];
    st.topic = ids[0];
    var chips = chipsFor(ids[0], l);
    if (chips.length < 3) chips.push(CHIPS[l].more);
    return { text: texts.join(" "), go: K[id].go || null, chips: chips };
  }

  window.BubblesBrain = {
    reply: reply,
    fact: function (l) { return fact(l || st.lang); },
    setChangelog: setChangelog,
    setNews: function (en, de) { st.latestEn = en; st.latestDe = de; },
    setPlaces: function (free, total) { st.places = { free: free, total: total }; },
    lang: function () { return st.lang; }
  };
})();
