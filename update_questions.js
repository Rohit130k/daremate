const fs = require('fs');
const path = require('path');

const rawText = `Funny Category
Truth Questions
What is the most embarrassing thing you've done that you haven't told anyone about?
What's the worst fashion mistake you've ever made?
What's the silliest reason you've ever gotten in trouble?
What's the most embarrassing thing you've done in front of a crush?
What's the weirdest thing you've ever eaten?
If you had to wear a costume every day for the rest of your life, what would it be?
What's the weirdest nickname you've ever been given?
What's the strangest dream you've ever had?
What's the weirdest thing you've ever done when you were alone?
What's your most bizarre hidden talent?
What was your most embarrassing moment during a date?
What's the worst gift you've ever received and pretended to like?
What's the laziest thing you've ever done?
What's the worst haircut you've ever had?
What's the most embarrassing thing your parents have caught you doing?
What's the most embarrassing text message you've sent or received?
What's your most embarrassing childhood memory?
What's the most awkward situation you've been in with a stranger?
What's the silliest thing you've done to get someone's attention?
What's the most ridiculous rumor you've ever heard about yourself?
What's your worst public bathroom experience?
What's the funniest prank you've ever played on someone?
What's your most embarrassing moment in school/college?
Have you ever laughed so hard something embarrassing happened?
What's the funniest way you've ever been injured?
What's your go-to fake name when meeting strangers you don't want to know?
What's the most ridiculous argument you've ever had?
What's the worst thing you've accidentally sent to the wrong person?
What's the most embarrassing thing you've done while trying to impress someone?
What's the strangest thing you've ever bought?
What's the most childish thing you still do?
What's the weirdest thing you've ever Googled?
What's your most irrational fear?
What's your most ridiculous impulse purchase?
What's the most embarrassing thing in your search history?
What's the weirdest way you've met someone?
What's the most awkward situation you've been in because you were trying to be polite?
What's your most embarrassing wardrobe malfunction?
What's the funniest misunderstanding you've been involved in?
What's the most embarrassing thing that's happened to you at a restaurant?
What's the strangest place you've ever fallen asleep?
What inappropriate question have you always wanted to ask someone in this room?
What's the most ridiculous thing you've ever done on a dare?
If you had to create a silly slogan for your life, what would it be?
What's the weirdest thing you do when you're alone in your car?
What's the most embarrassing thing you've done at work or school?
What's the strangest thing you've done to attract a crush?
What's your most embarrassing moment in front of a large group of people?
What's the funniest thing that's happened to you this year?
What's the weirdest habit you have?
What's your most awkward elevator experience?
What's the funniest thing you've ever witnessed?
What's your funniest "I thought I was alone" moment?
What's the most embarrassing item in your room right now?
What's the weirdest rumor you've heard about someone you know?
What's the most bizarre encounter you've had with a stranger?
What's the most ridiculous excuse you've ever used?
What's your funniest falling asleep somewhere inappropriate story?
If your life had a blooper reel, what would be the funniest moment?
What's your weirdest shower thought?
What's something weird you do only when you're sick?
What's the strangest compliment you've ever received?
What's your most embarrassing moment with technology?
What's the silliest argument you've had with a significant other?
What's the most awkward situation you've had in a public restroom?
What's the most embarrassing thing you've ever done on a date?
What's the weirdest thing you believed as a child?
What's the most embarrassing thing in your internet search history?
What's your most embarrassing auto-correct fail?
What's the most ridiculous nickname you've given someone else?
What's the funniest thing you've seen someone do while they thought nobody was watching?
What's the most unusual way you've injured yourself?
What's the funniest way you've tried to get out of trouble?
What's the stupidest thing you've done because someone dared you to?
If your pet could talk, what embarrassing secrets would they reveal about you?
What's the weirdest food craving you've ever had?
What's the most embarrassing song on your playlist?
What's the most embarrassing clothing item you've worn in public?
What's the most ridiculous thing you've done to avoid doing chores?
What's the most embarrassing thing you've accidentally sent to the wrong person?
What's the strangest thing you've ever stolen?
What's the funniest thing you've done while sleepwalking?
What's the weirdest place you've ever gotten stuck?
What's the most embarrassing thing that's happened to you in front of your in-laws?
If you had to create a ridiculous business, what would it be?
What's the funniest misunderstanding you've had with a teacher or professor?
What's the silliest fear you had as a child?
What's the most embarrassing thing you've done while daydreaming?
What's the most ridiculous thing you've done to impress a crush?
What's the funniest lie you've told that backfired?
What's your most awkward handshake/hug experience?
What's the most embarrassing thing that's happened during a workout?
What's your funniest drunk story?
What's the most embarrassing thing you've done in an attempt to be cool?
What's the silliest thing you've ever spent money on?
What's the most absurd excuse you've made to get out of plans?
What's your most embarrassing moment with someone famous?
What's the funniest wrong name you've ever called someone?
Dare Questions
Attempt to do 10 push-ups with a funny twist of your choice
Text the third person in your contacts list asking for a recipe for unicorn soup
Post a funny face selfie on your social media with a caption chosen by the group
Do your best impression of a famous movie character for 30 seconds
Make up and perform a short commercial for a ridiculous product
Call a friend and speak in a funny accent for the entire conversation
Put on a blindfold and try to draw a cat on paper
Do your best robot dance for 30 seconds
Exchange an item of clothing with the person next to you for the next three rounds
Tell a joke while holding water in your mouth (don't spit it out!)
Act out a scene from your favorite movie without speaking
Make up a rap about the person to your left
Speak in a fake accent for the next three rounds
Let someone draw something on your face with washable marker
Do your best impression of a celebrity of the group's choice
Create and perform a 30-second commercial for toilet paper
FaceTime someone and sing them happy birthday (even if it's not their birthday)
Make up a silly dance to a song of the group's choice
Try to make a funny animal noise every time someone says your name for the next 5 rounds
Put ice cubes down your shirt and dance until they melt
Let the group give you a silly makeover
Say the alphabet backwards while doing jumping jacks
Make up a short song about the host of the game
Do your best runway walk across the room
Text your crush or a friend a cheesy pickup line
Eat a small food item of the group's choice without using your hands
Tell a funny story about the person to your right (real or made up)
Try to juggle with three random objects chosen by the group
Wear your clothes backward for the next 3 rounds
Attempt to breakdance for 15 seconds
Make a prank call to a business and ask if they have something ridiculous in stock
Try to sell a random object in the room to the group using a sales pitch
Pretend you're underwater for the next minute
Let someone style your hair in a ridiculous way
Do your best opera singing voice for 30 seconds
Make a sandwich using weird ingredient combinations suggested by the group
Try to do a handstand (with help if needed)
Send a funny meme to a random contact
Pretend to be a news reporter and give a breaking news report about something silly
Put on as many items of clothing as you can in 30 seconds
Try to impersonate someone in the room for 1 minute
Do 10 jumping jacks while reciting the pledge of allegiance
Make a paper airplane and try to hit a target chosen by the group
Record a funny voice message and send it to a contact of your choice
Do your best impression of a Disney character
Switch clothes with another player for the next 3 rounds
Try to tell a joke while your mouth is full of water (don't swallow or spit!)
Let someone put makeup on you with their non-dominant hand
Wear your shoes on the wrong feet for the next 3 rounds
Sing a children's song in a heavy metal style
Try to lick your elbow while everyone watches
Create a superhero pose and name your superhero alter ego
Draw a portrait of someone in the room with your eyes closed
Make a hat out of whatever materials are available and wear it for 3 rounds
Attempt to moonwalk across the room
Speak in rhymes for the next 2 rounds
Let someone give you a wet willy
Recite the pledge of allegiance while doing lunges
Make up a secret handshake with the person to your right
Call a family member and tell them you've decided to join the circus
Attempt to do a cartwheel
Smell everyone's feet and rank them from best to worst
Let someone feed you a bite of food while you're blindfolded
Speak with a mouth full of water (don't swallow or spit it out!) for 30 seconds
Try to pop a balloon without using your hands or teeth
Create a TikTok dance to a song of the group's choice
Pretend to be a zombie for the next 2 rounds
Make a brief speech about why potatoes are the superior vegetable
Call a pizza place and ask how many pizzas you would need to stack to reach the moon
Wear your underwear over your pants for the next 3 rounds (over your clothes)
Try to drink a glass of water while standing on your head (with help!)
Send a text message with your eyes closed
Try to fit as many marshmallows (or small food items) in your mouth as possible
Create a funny haiku about the person across from you
Eat a spoonful of a condiment of the group's choice
Do an interpretive dance about your week
Talk like a pirate for the next 3 rounds
Try to balance three random objects on your head for 30 seconds
Let the group create a social media post for you
Try to do a magic trick with objects in the room
Make a tinfoil hat and wear it for the next 3 rounds
Try to touch your nose with your tongue
Let someone draw a unibrow on you with washable marker
Make a paper hat and wear it for the rest of the game
Call a friend and only communicate by singing
Take a selfie with a funny face and make it your profile picture for 24 hours
Try to tell a story while gargling water
Attempt to tell a knock-knock joke to someone who's not playing
Create and perform a jingle for a mundane household object
Let the group style your hair in the silliest way possible
Try to balance on one foot while counting backward from 30
Try to hula hoop with an imaginary hula hoop for 30 seconds
Do an impression of someone famous until someone correctly guesses who it is
Try to tell a joke while your cheeks are full of air
Sing a popular song in slow motion
Make up a cheer about the person to your left
Try to make a funny sound that no one in the group has heard before
Wear socks on your hands for the next 3 rounds
Let the group give you a funny nickname that you must respond to for the rest of the game
Try to balance a spoon on your nose for 30 seconds
Create a short standup comedy routine about your day
Let everyone in the group give you one gentle slap on the face (if comfortable)
Make animal noises in response to the next 3 questions you're asked
Try to walk across the room with a book on your head
Romantic Category
Truth Questions
What's your idea of a perfect date?
Have you ever been in love? How did you know?
What's the most romantic thing someone has done for you?
What's the most romantic thing you've done for someone else?
What's your favorite physical feature about the person you're attracted to?
What's your love language?
What was your first kiss like?
What's the most heartwarming compliment you've ever received?
What's your idea of romance?
What celebrity do you have a crush on?
What's the most embarrassing thing that happened on a date?
What's the sweetest thing someone has said to you?
Have you ever written a love letter?
What's the most romantic movie in your opinion?
What's the most meaningful gift you've ever received?
What song reminds you of falling in love?
Have you ever had a crush on a friend's partner?
What's your biggest turn on (non-physical)?
Have you ever had a secret admirer?
What's your favorite romantic memory?
What's something romantic you've always wanted someone to do for you?
Have you ever fallen in love at first sight?
What's the longest you've gone without seeing a significant other?
What would be an ideal honeymoon destination for you?
What's the most spontaneous romantic thing you've done?
What's a relationship deal-breaker for you?
What's the most memorable Valentine's Day you've had?
Have you ever kept something from a past relationship as a memento?
What's your favorite thing about being in a relationship?
What's the most romantic song lyric you know?
What celebrity couple do you admire?
Have you ever been on a blind date? How did it go?
What's the most romantic setting or location you can think of?
Have you ever had a long-distance relationship?
What's the most embarrassing gift you've given or received from a romantic partner?
What was your first heartbreak like?
What's the most romantic language?
What's the most romantic gesture in a movie that you wish would happen to you?
What's your ideal proposal scenario?
Have you ever had a crush on a teacher or professor?
What song would you want for your first dance at your wedding?
What's the most romantic place you've ever been?
What's the most overrated romantic gesture?
What's the nicest thing a romantic partner has done for you when you were sick?
What's something you've always wanted to try with a partner but haven't yet?
What's your definition of true love?
What's the most underrated romantic gesture?
What's your favorite romantic comedy?
What was your worst date ever?
What's more important in a relationship: trust or passion?
What's the most adventurous date you've been on?
What pet names have you called your partners or have they called you?
Would you rather have a passionate short-lived romance or a stable long-term relationship?
What's the most ridiculous thing you've done to get someone's attention?
What celebrity do you think would be the best kisser?
Have you ever fallen for a friend?
What's the most romantic song you know?
What fictional character would you want as your romantic partner?
What's your idea of a perfect anniversary celebration?
Have you ever been caught checking someone out?
What's the sweetest thing your partner has ever said to you?
What's your favorite way to show affection?
What's the most romantic time of year in your opinion?
Have you ever had a workplace crush?
What's the most meaningful relationship advice you've received?
What's the most awkward romantic encounter you've had?
What's the most romantic thing you've seen in real life?
What's something romantic you'd like to experience?
What's the most embarrassing way you've tried to flirt with someone?
Have you ever dated someone your friends or family didn't approve of?
What's the best part about the beginning stages of a relationship?
What song makes you think of an ex?
What's the most extreme thing you've done for love?
Would you rather date someone who makes you laugh or someone who is incredibly smart?
What's the longest you've gone without speaking to a significant other during a fight?
What's the most romantic scene in a movie?
What unexpected trait do you find attractive in others?
What's your most cherished couple tradition from a past or current relationship?
Have you ever been the one to end a relationship? How did you do it?
What's a song that reminds you of heartbreak?
What's something unexpectedly romantic that someone has done for you?
Have you ever gone on a vacation with a romantic partner?
What's the most romantic book you've read?
What celebrity couple would you want your relationship to be like?
Have you ever been in an on-again, off-again relationship?
What's the biggest sacrifice you've made for love?
What's the most romantic era in history?
What's the most important quality in a romantic partner?
Have you ever had a crush on a fictional character?
What's the longest relationship you've had?
What's your favorite way to spend quality time with a partner?
What's a romantic deal-maker for you?
What's the most thoughtful gift you've received from a romantic partner?
Have you ever been in love with someone who didn't love you back?
What song would be playing during your rom-com montage?
What's something romantic a partner did that you didn't appreciate at the time?
What's the most surprising thing you've learned about love?
What's your favorite love story (real or fictional)?
What's the most awkward date you've ever been on?
What's your favorite memory with a significant other?
Have you ever had a crush on a friend's sibling?
What's the most embarrassing thing you've done in front of a crush?
What would be your ideal romantic weekend?
Have you ever kept a relationship secret?
Dare Questions
Write a short love poem for someone in the room
Give a genuine compliment to each person in the room
Slow dance with someone of the group's choosing for 30 seconds
Call/text someone you care about and tell them you appreciate them
Share a romantic fantasy you have
Create a romantic date idea for under $20
Give a hand massage to the person on your right
Tell everyone your favorite thing about love
Do your best romantic movie impression
Serenade someone with a love song
Feed someone a bite of food as romantically as possible
Create a romantic pickup line for someone in the group
Make up a romantic story that includes everyone in the room
Give someone a compliment in a different language
Sit on someone's lap for the next round
Write down three qualities that make someone a good partner
Tell the story of your first crush
Give someone a back rub for 30 seconds
Make intense eye contact with someone for 30 seconds without laughing
Do your best romantic dance move
Share your ideal romantic evening
Have everyone write down what they find attractive about you
Recreate a famous romantic movie scene with someone
Give someone a piggyback ride around the room
Have someone feed you a bite of food with your eyes closed
Call the last person you texted and tell them you miss them
Tell a story about your first kiss (or what you imagine it will be like)
Write a short love letter to a fictional character
Let someone style your hair how they want
Make a list of 5 qualities you look for in a partner
Give your phone to someone and let them send a sweet message to anyone of their choosing
Post a heartfelt message on social media about someone in the room
Put your arm around the person next to you for the next round
Have each person say what they think your best quality is
Go outside and yell "I believe in love!" as loud as you can
Hold hands with the person to your left for the next 2 rounds
Let someone give you a makeover
Let someone take a romantic-style photo of you
Give a romantic nickname to each person in the room
Have everyone write down a romantic movie and you have to act out one of them
Do your best impression of a rom-com protagonist in a "running to stop them from leaving" scene
Let someone feed you a drink
Try to make someone blush with compliments
Act out a romantic proposal to someone in the room
Create a romantic cocktail/mocktail for someone (if ingredients are available)
Dance with someone to a slow song
Whisper something sweet to the person on your right
Give someone a kiss on the cheek or hand
Write down your idea of a perfect date and share it
Give someone a gentle face massage
Let someone trace a heart somewhere on your body
Create a love horoscope for each person in the room
Feed someone something sweet with your eyes closed
Do your best flirtatious eye contact with someone
Let the group vote on who you should write a short love poem about
Create a handmade gift for someone in under 2 minutes using available materials
Let someone pose you in a romantic movie poster position
Create a 30-second "falling in love" montage with someone
Tell a romantic story that includes everyone in the room
Give someone a foot massage for 30 seconds
Have someone feed you with your eyes closed and guess what it is
Let someone style your hair romantically
Sing a romantic song chorus to someone
Create a romantic handshake with someone
Share one romantic goal you have for the future
Make up a romantic story about meeting someone in the room for the first time
Give someone a hug for 10 seconds
Describe your dream wedding
Let someone write "Love" somewhere on your body with a marker
Text your last romantic interest (if appropriate) and tell them you were thinking of them
Wear someone else's clothing item for the next 3 rounds
Do your best romantic comedy slow-motion run toward someone
Have a staring contest with someone of the group's choice
Let someone draw a romantic symbol on your arm/hand
Share a romantic song that reminds you of someone (past or present)
Create a romantic dinner menu for someone in the room
Let someone put lipstick/chapstick on you without using your hands
Pretend to be on a first date with someone for the next round
Create a toast to love and relationships
Do a trust fall with someone in the room
Create a romantic "how we met" story with someone in the room
Close your eyes and let someone give you three kisses on your face (appropriate places only)
Let someone feed you something while you're blindfolded
Write a romantic fortune for each person in the room
Group hug everyone for at least 5 seconds
Create a secret gesture that means "I love you" with someone
Tell everyone something you love about yourself
Let someone trace a heart on your back and guess what they're drawing
Do a romantic scene from a movie with someone
Create a short romantic story that includes someone in the room
Set up the perfect selfie with someone and post it (if comfortable)
Whisper sweet nothings into someone's ear for 15 seconds
Let someone give you a temporary tattoo or draw on you
Reveal your celebrity crush and why you're attracted to them
Say something sweet to each person in the room
Let the group come up with a romantic nickname for you to use for the rest of the game
Have someone trace letters on your back and try to spell out a romantic word
Create a signature cocktail/drink named after your romantic ideal
Let someone dress you up with available accessories
Call/text an ex (if appropriate) and say something positive about the time you spent together
Strip Category
Truth Questions
What's something you'd never wear in public?
Have you ever skinny dipped?
What's your biggest turn-on?
Have you ever been to a strip club?
What article of clothing do you feel most attractive in?
Have you ever had a wardrobe malfunction?
Would you ever consider being a stripper for one night?
What's the least amount of clothing you've worn in public?
Have you ever been caught undressing?
Would you rather be too hot or too cold?
Have you ever sent a revealing photo to the wrong person?
What's your most embarrassing changing room story?
What's the longest you've gone without wearing clothes?
Would you ever go to a nude beach?
Have you ever forgotten an important piece of clothing?
What's your favorite physical feature on yourself?
Have you ever been dared to strip?
What's the most revealing outfit you've ever worn?
Have you ever had to borrow someone else's underwear?
What's your most embarrassing tan line story?
Have you ever had to do a walk of shame?
What's your opinion on skinny dipping?
Would you rather constantly be overdressed or underdressed?
Have you ever accidentally seen someone naked?
What's your most awkward changing room story?
Would you rather always be too hot or too cold?
Have you ever been in public and realized your outfit was see-through?
What's your most embarrassing swimsuit story?
Have you ever worn something drastically different from your usual style on a dare?
What color underwear are you wearing right now?
Have you ever gone commando?
What's the shortest time you've owned an article of clothing before losing it?
Have you ever worn someone else's clothes without asking?
What's your most embarrassing clothing shopping experience?
Have you ever accidentally flashed someone?
What's your least favorite part of your body to expose?
Would you rather lose your pants or your shirt in public?
Have you ever had a nightmare about being naked in public?
What's your favorite body part on the gender(s) you're attracted to?
Have you ever been to a spa that required nudity?
What's the longest you've gone wearing the same underwear?
Would you ever participate in a naked bike ride event?
Have you ever been mistaken for someone else while undressed?
What's the furthest you've traveled without underwear?
Would you rather have to change in a public space once or never be able to change your clothes for a month?
Have you ever had someone walk in on you while changing?
What's the strangest place you've had to change clothes?
Would you ever date a stripper?
Have you ever been embarrassed by visible underwear lines?
What's your most awkward hot tub experience?
Would you go to a nude resort if invited?
Have you ever been caught trying on someone else's clothes?
What's your most embarrassing doctor's examination story?
Would you rather never wear underwear again or have to wear three layers of underwear every day?
Have you ever unintentionally seen a family member naked?
What's your most embarrassing "clothes not fitting" story?
Would you rather always be slightly underdressed or dramatically overdressed for every occasion?
Have you ever realized your zipper was down in public?
What type of outfit makes you feel most confident?
Would you rather have your shirt or pants fall down in public?
Have you ever bought clothing that you never wore because it was too revealing?
What's the most money you've spent on underwear?
Have you ever accidentally worn mismatched underwear on an important day?
What's your most embarrassing story involving a swimsuit?
Have you ever worn clothing items in unconventional ways to appear more revealing?
What's the most uncomfortable piece of clothing you've worn for the sake of looking good?
Would you rather have visible panty/underwear lines or a visible bra strap?
Have you ever had clothing altered to make it more revealing?
What clothing item do you secretly enjoy wearing that others might find surprising?
Would you rather wear a swimsuit one size too small or one size too big?
Have you ever sent a revealing photo to someone?
What's the longest you've gone without wearing a particular type of clothing?
Would you rather be overdressed or underdressed for a formal event?
Have you ever been in a situation where you were underdressed among friends?
What's the most embarrassing thing that's fallen out of your clothing in public?
Would you rather have to wear wet clothing for a day or slightly dirty clothing for a week?
Have you ever pretended to accidentally reveal more than intended?
What's your favorite type of loungewear?
Would you rather always have a visible stain on your clothing or always have something stuck in your teeth?
Have you ever been judged for wearing something too revealing?
What's the strangest thing you've ever worn as a makeshift piece of clothing in an emergency?
Would you rather have to wear all of your clothes inside out or backward for a year?
Have you ever tried on clothes that were way too small just to see if they would fit?
What's the most uncomfortable fashion trend you've participated in?
Would you rather wear sandals with socks every day or never be able to wear sandals again?
Have you ever been embarrassed by a hole in your clothing in public?
What's your most private clothing preference that most people don't know about?
Would you rather have to wear your current outfit for a month straight or wear a different bizarre outfit every day for a year?
Have you ever worn something specifically hoping that someone would notice you?
What's your least favorite type of clothing to shop for?
Would you rather never be able to wear jeans again or never be able to wear comfortable shoes again?
Have you ever had clothing ruined during an intimate moment?
What's the longest you've spent in pajamas without changing?
Would you rather wear a swimsuit in the snow or a winter coat at the beach?
Have you ever been caught checking yourself out in a mirror or reflective surface?
What's the most useless piece of clothing you own but won't get rid of?
Would you rather have to dress like your mother/father for a year or have them dress like you for a year?
Have you ever ripped your pants in public?
What's the longest you've gone without doing laundry?
Would you rather never be able to change your hairstyle again or never be able to wear stylish clothes again?
Have you ever worn something that another person told you looked bad?
What's your favorite lounging-around-the-house outfit?
Would you rather always be slightly too warm or slightly too cold?
Have you ever borrowed clothing from someone you were dating?
What's a fashion risk you've always wanted to take but haven't had the courage to try?
Dare Questions
Remove one accessory or item of clothing
Do 10 jumping jacks
Dance without music for 30 seconds
Show everyone your bare feet
Roll up your sleeves or pant legs as high as they'll go
Let someone take a picture of you flexing
Switch an item of clothing with another player for two rounds
Show the label of your shirt/top without taking it off
Do your best model walk across the room
Unbutton the top/bottom button of your shirt
Show everyone what's in your pockets (if comfortable)
Demonstrate your best dance move
Do 5 push-ups
Take off your socks if you're wearing any
Strike three different poses like you're modeling
Let another player fix/style your hair how they want
Remove one piece of jewelry if you're wearing any
Show the tag/label of your clothing to the group
Do a handstand against the wall (if safe)
Let someone roll up your sleeves or pant legs
Show your bare shoulders if you can without removing clothing
Do 10 squats
If you're wearing layers, remove one layer
Flex your muscles in three different poses
Show everyone the bottom of your shoes
If wearing long sleeves, roll them up past your elbows
Let someone touch your hair for 5 seconds
Take off one item of clothing and put it back on backward
Do a plank for 20 seconds
If you have multiple layers on top, remove the outer layer
Let someone roll up the bottom of your pants/shorts slightly
Show your collarbone (if comfortable)
Do 5 sit-ups
If you have long hair, put it up/tie it back (or let it down if it's already up)
Remove one item of clothing for one round then put it back on
Do yoga pose of your choice for 15 seconds
Untuck your shirt if it's tucked in (or tuck it in if it's not)
Show everyone your bare arms if they're not already visible
Do 10 jumping jacks
If you're wearing a watch or bracelet, take it off for one round
Strike a bodybuilder pose and hold it for 10 seconds
Remove one accessory until your next turn
Let someone unbutton/button one button on your clothing
Show a small area of skin that isn't normally visible with your current outfit (if comfortable)
Do a catwalk across the room
If you're wearing a belt, remove it for one round
Touch your toes while keeping your legs straight
Trade one accessory with another player for two rounds
Show everyone your outfit's label/tag
If wearing socks, take one off for the next round
Do a slow-motion run across the room
If you're wearing layers, adjust them to show more of your inner layer
Let someone roll one sleeve up and one sleeve down (if applicable)
Show the room what your bare ankle looks like
Do 5 lunges on each leg
Remove an accessory of your choice
Stretch your arms above your head for 15 seconds
If wearing pants with pockets, empty one pocket and show contents
Let someone pose you in a model pose
If wearing shoes, take them off for the next round
Do a slow stretch that shows off your flexibility
Switch seats with another player, making the transition as dramatic as possible
Loosen a piece of your clothing slightly
Show the most colorful piece of clothing you're currently wearing
If wearing a jacket, take it off until your next turn
Let someone adjust one piece of your clothing
Show a small birthmark or freckle if you have one visible (if comfortable)
Pose like a statue for 20 seconds while others take a good look
Remove your shoes if you're wearing any
Change your hairstyle in some way without using tools
Do 10 arm circles
Show what you're wearing on your wrist (watch, bracelet, nothing, etc.)
If wearing multiple rings, remove one
Do a "fashion show" turn and pose
Let another player adjust your collar (if applicable)
Take off one earring if wearing multiple
Strike a pose that accentuates your best feature
If wearing a scarf, take it off for the next round
Let someone roll up or adjust a piece of your clothing
Show off your arms in a flexing pose
Take off an outer layer if you're wearing one
Let another player fix one thing about your appearance
Sit cross-legged on the floor for the next round
Show the label/brand of your pants/bottoms without removing them
Remove one item of jewelry until your next turn
Do a stretching pose that shows off your form
Let another player mess up your hair slightly
If wearing glasses, take them off for one round
Remove one non-essential item you're wearing
Let the group choose one small adjustment to your outfit
If you have long sleeves, push them up to your elbows
Show everyone the inside label of your top/shirt (if accessible)
Strike three different model poses in succession
Let someone adjust your hair for 10 seconds
Show your ankles to everyone (if not already visible)
Do a stretch that shows your flexibility
If wearing a button-up shirt, unbutton one button
Let someone touch your arm for 5 seconds
Remove one small accessory for two rounds
Let another player whisper something in your ear while touching your shoulder
Show what color socks you're wearing (or your bare feet if none)
Fix your hair in the most attractive way you can without a mirror
Adjust your clothing to make yourself more comfortable
Loosen your shoelaces or take off your shoes if comfortable
18+ Category
Truth Questions
What's your biggest turn-on?
What's your biggest turn-off?
What's your most sensitive body part?
What's your favorite position?
What's your wildest fantasy?
Have you ever been caught in the act?
What's the most spontaneous intimate encounter you've had?
Have you ever role-played?
What's the most unusual place you've been intimate?
What's a secret desire you haven't told a partner?
Have you ever sent a revealing photo?
What's the boldest move you've ever made on someone?
What do you think about in private moments?
Have you ever been caught pleasuring yourself?
What's the longest you've gone without intimacy?
What's the quickest you've ever been intimate with someone after meeting them?
What's something intimate you want to try but haven't yet?
Have you ever lied about being satisfied?
What's the most awkward thing that's happened during an intimate moment?
What's the most risqué thing you've done in public?
Have you ever been intimate with someone whose name you didn't know?
What's your favorite time of day for intimacy?
What's your favorite body part on a partner?
Have you ever had a one-night stand?
What's the most embarrassing thing that's happened during an intimate moment?
What's the most number of times you've been intimate in one day?
Have you ever used an adult toy?
What celebrity would you most want to be intimate with?
What's your favorite form of foreplay?
Have you ever done something intimate that you regretted?
What's the wildest place you've ever been intimate?
Have you ever been attracted to someone you weren't supposed to be?
What's the most adventurous intimate experience you've had?
Have you ever been intimate while someone else was in the same room?
What's something intimate that you initially didn't enjoy but now do?
What's your favorite intimate sound?
Have you ever faked excitement to please a partner?
What do you wear (or not wear) to bed?
What's the most unusual thing that turns you on?
Have you ever been intimate in a place where you might get caught?
What's your favorite intimate memory?
Have you ever watched adult entertainment with a partner?
What's your biggest intimate insecurity?
Have you ever had a friends-with-benefits relationship?
What's something intimate that's overrated in your opinion?
Have you ever been attracted to someone much older or younger than you (within legal age)?
What's an intimate deal-breaker for you?
Have you ever done something intimate just to please your partner?
What's the longest intimate session you've had?
Have you ever been intimate with an ex after breaking up?
What's something you'd never do in the bedroom?
Have you ever been intimate with someone you weren't attracted to?
What's the most unexpected place you've been turned on?
Have you ever had a crush on a friend's partner?
What's your most embarrassing intimate moment?
Have you ever had an inappropriate dream about someone in this room?
What's the most surprising thing that turns you on?
Have you ever been caught watching adult entertainment?
What's the boldest thing you've done to seduce someone?
Have you ever had a significant age gap in a relationship?
What's your favorite part of being intimate?
Have you ever been emotionally intimate with someone without being physically intimate?
What's something intimate that's overrated?
Have you ever been intimate in an unusual location?
What a fantasy you have that you haven't told anyone about?
Have you ever had a "friends with benefits" situation that became complicated?
What's your favorite body part on yourself to be touched?
Have you ever thought about someone else while being intimate with a partner?
What's the most intimate non-physical thing someone can do for you?
Have you ever had a virtual intimate experience?
What's something you wish you could change about your intimate life?
Have you ever had an "almost" encounter that didn't happen?
What's a non-physical quality that turns you on?
Have you ever been intimate with someone you weren't in a relationship with?
What's something you enjoy that might surprise your partners?
Have you ever denied a partner intimacy as punishment?
What's your favorite intimate setting or atmosphere?
Have you ever had to fake interest to avoid hurting someone's feelings?
What's the most uncomfortable intimate situation you've been in?
Have you ever regretted not being intimate with someone when you had the chance?
What's the most memorable compliment you've received in an intimate setting?
Have you ever had an inappropriate crush on someone in a position of authority?
What's the most embarrassing thing you've said during an intimate moment?
Have you ever been intimate while intoxicated and regretted it?
What's a physical attribute that instantly attracts you to someone?
Have you ever maintained an intimate relationship just for that aspect?
What's the most awkward post-intimacy moment you've experienced?
Have you ever had feelings for a friend but kept them secret?
What's a non-intimate trait that you find incredibly attractive?
Have you ever been intimate with someone to make someone else jealous?
What's the most overrated intimate activity?
Have you ever had intimate thoughts about someone inappropriate?
What's the most sensitive part of your body?
Have you ever sabotaged a potential relationship because you were scared of intimacy?
What's your most embarrassing intimate mistake?
Have you ever been caught buying something intimate or embarrassing?
What's the most intimate thing someone can say to you?
Have you ever developed feelings for someone you were just physically involved with?
What's something that instantly kills the mood for you?
Have you ever continued a relationship just for the physical aspect?
What's the most awkward conversation you've had about intimacy?
Have you ever been intimate with someone out of pity?
What non-physical trait do you find most attractive in potential partners?
Have you ever had an inappropriate dream about someone you know?
What's the most unusual thing you've tried in the bedroom?
Have you ever lied about your number of partners?
What's something intimate that you enjoy but are embarrassed to admit?
Have you ever snooped through a partner's private things?
Dare Questions
Give a seductive dance to someone of your choice for 30 seconds
Demonstrate your best kissing technique on your hand
Send a flirty text to someone in your contacts (keep it tasteful)
Exchange an item of clothing with another player (if comfortable)
Give someone a back massage for 30 seconds
Demonstrate what you think is a seductive walk
Whisper something flirty in someone's ear
Demonstrate your best physical feature in a tasteful way
Show your best seductive facial expression
Use a fruit or vegetable to demonstrate something intimate (keep it PG-13)
Do your best impression of a romance novel cover pose
Give someone a lap dance for 15 seconds (if comfortable)
Show your best bedroom eyes to someone in the group
Take off one item of clothing (nothing essential, stay decent!)
Let someone feed you something in a seductive way
Act out a scene from a steamy movie (keep it appropriate)
Give someone a sensual hand massage
Demonstrate what you think is the perfect kiss (without actually kissing anyone)
Let someone trace an ice cube on your arm or neck for 10 seconds
Show your most attractive pose
Describe your perfect romantic evening in a seductive voice
Let someone draw something on a concealed part of your body (nothing inappropriate)
Do your best seductive voice saying an unsexy phrase
Create a sultry cocktail name and describe its ingredients
Demonstrate your idea of flirty body language
Make eye contact with someone for 30 seconds without breaking or laughing
Make up a sensual-sounding poetry verse about something totally unsexy
Let someone give you a neck massage for 30 seconds
Recreate a famous movie kiss scene with a pillow
Feed someone a bite of food in the most seductive way possible
Describe your ideal partner in a sensual voice
Do a seductive crawl across the floor
Let someone touch your hair for 15 seconds
Put an ice cube in your mouth until it melts
Act out what you think happens in a romance novel scene
Use a piece of fruit to demonstrate your kissing technique
Tell someone what you find attractive about them while maintaining eye contact
Let someone trace their finger along your arm while you close your eyes
Let someone whisper whatever they want in your ear
Eat something in the most seductive way possible
Take a sensual selfie (keeping it appropriate) and share it with the group
Let someone trace a heart somewhere on your body
Do your best celebrity impersonation saying something flirty
Make up a cocktail/drink name after yourself and describe why it's hot
Let someone blindfold you for the next round
Give someone a gentle shoulder massage
Do your best "smoldering" look from a romance novel cover
Let someone brush/play with your hair for 30 seconds
Demonstrate your most attractive dance move
Let someone feed you something while you're blindfolded
Make a seductive face while saying something completely non-seductive
Say "yes" in the most seductive way possible
Let someone draw a heart on your body somewhere (appropriate)
Exchange compliments with the person to your right while maintaining eye contact
Do your most seductive lip bite
Let someone of your choice sit on your lap for the next round
Demonstrate how you'd approach someone you find attractive at a bar
Let the group pose you in a "romance novel cover" pose
Demonstrate your most seductive move (keeping it appropriate)
Let someone of your choice give you a compliment while touching your arm
Do your best impression of a perfume/cologne commercial
Show the group your best "bedroom eyes"
Let another player whisper something in your ear while touching your shoulder
Act out how you think a first kiss should happen (using a pillow or stuffed animal)
Make eye contact with someone while taking a bite of food
Take off your socks in the most dramatic way possible
Let someone draw an invisible tattoo on your arm or hand with their finger
Demonstrate your best "romantic lead in a movie" pose
Feed someone a drink in a seductive way
Let someone place their hand on your knee for 20 seconds
Close your eyes while someone touches your face gently for 10 seconds
Tell a normal story in your most seductive voice
Let someone apply lip balm/lipstick to your lips
Sensually eat a piece of fruit
Let someone whisper compliments in your ear for 15 seconds
Do your best "caught in the rain" romance scene impression
Let someone touch your face gently for 10 seconds while maintaining eye contact
Demonstrate how you'd flirt with someone using only body language
Let another player give you a compliment while gently touching your hand
Let the group choose a pose for you to hold for 15 seconds
Read an ordinary text message in your most seductive voice
Let someone feed you a small piece of food or drink
Demonstrate how you'd seduce someone using only your eyes
Let another player trace their finger slowly from your wrist to your elbow
Create a flirty nickname for each person in the room
Let someone gently caress your hand for 15 seconds
Whisper something in your own ear seductively using a mirror or phone camera
Pose like you're on the cover of a romance novel
Give someone a gentle face massage for 15 seconds
Let someone trace a word on your back with their finger and try to guess what it is
Let someone place an ice cube on your neck, collarbone, or wrist
Sensually describe a totally non-sensual object in the room
Let someone put an arm around you for the next round
Demonstrate your interpretation of a "come hither" look
Let someone trace their finger along your jawline
Give a 15-second monologue about something mundane in a seductive voice
Feed yourself something in the most seductive way you can
Let someone gently stroke your hair for 15 seconds
Sensually fan yourself while making longing glances at someone
Have a staring contest with someone of the group's choice
Let someone trace a heart on your palm
Share a sensual-sounding recipe for a completely unsexy food
Let someone pose you in a "romance hero/heroine" pose
Let the group choose someone for you to feed a bite of food to
Share a flirty inside joke with the group`;

const lines = rawText.split(/\r?\n/);
const result = { categories: {} };

let currentCat = null;
let currentMode = null; // 'truths' or 'dares'

lines.forEach(line => {
    line = line.trim();
    if (!line) return;
    
    if (line.toLowerCase().endsWith('category')) {
        currentCat = line.split(' ')[0].trim();
        result.categories[currentCat] = { truths: [], dares: [] };
        return;
    }
    
    if (line.toLowerCase() === 'truth questions') {
        currentMode = 'truths';
        return;
    }
    
    if (line.toLowerCase() === 'dare questions') {
        currentMode = 'dares';
        return;
    }
    
    if (currentCat && currentMode) {
        result.categories[currentCat][currentMode].push(line);
    }
});

fs.writeFileSync(path.join(__dirname, 'server', 'data', 'questions.json'), JSON.stringify(result, null, 2));
console.log('✅ Updated questions.json!');
