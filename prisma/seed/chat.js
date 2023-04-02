const {PrismaClient} = require('@prisma/client')
const {chat, message} = new PrismaClient()

const CHATS = [
  {
    id: 1,
    title: 'Web developer chat',
    userIds: [
      1, 2
    ],
    messages: [
      { userId: 1, message: "Hey, have you been keeping up with the latest programming languages?" },
      { userId: 2, message: "Yeah, I've been looking into Rust lately. Have you tried it out?" },
      { userId: 1, message: "No, I haven't. What's so special about it?" },
      { userId: 2, message: "It's great for systems programming, and it has built-in memory safety features. Plus, it's really fast." },
      { userId: 1, message: "Interesting. I'll have to check it out. Have you heard of F#?" },
      { userId: 2, message: "Yeah, it's a functional programming language for .NET. Have you used it before?" },
      { userId: 1, message: "Not yet, but I've been meaning to try it out. What do you think of it?" },
      { userId: 2, message: "I really like it. It has some great features for working with immutable data, and it's really expressive." },
      { userId: 1, message: "That sounds pretty cool. Do you have any favorite libraries or frameworks you like to use?" },
      { userId: 2, message: "For Rust, I really like using Rocket for web development. And for F#, I've been using the SAFE stack lately." },
      { userId: 1, message: "I've heard good things about Rocket. How does it compare to other web frameworks?" },
      { userId: 2, message: "It's definitely more low-level than some other frameworks, but it gives you a lot of control over your application." },
      { userId: 1, message: "Got it. And what about the SAFE stack? What's that like?" },
      { userId: 2, message: "It's a combination of several libraries and frameworks for building full-stack web applications with F#. It's really easy to use and very productive." },
      { userId: 1, message: "That sounds awesome. I'll have to give it a try. Do you have any other recommendations for learning programming?" },
      { userId: 2, message: "Definitely check out Codecademy and FreeCodeCamp. They're both great resources for learning programming for free." },
      { userId: 1, message: "Thanks for the tips. I'll check those out. What about books? Any good ones you've read?" },
      { userId: 2, message: "Yeah, I really enjoyed 'Clean Code' by Robert C. Martin. It's a great book for learning how to write clean and maintainable code." },
      { userId: 1, message: "I've heard of that one. I'll add it to my list. Have you read 'Code Complete' by Steve McConnell?" },
      { userId: 2, message: "Yes, that's another great book. It's very comprehensive and covers a lot of different topics in programming." },
      { userId: 1, message: "Awesome. I'll definitely check that one out too. What kind of programming projects have you been working on lately?" },
      { userId: 2, message: "I've been working on a Rust library for parsing CSV files. It's been really challenging but also very rewarding." },
      { userId: 1, message: "That sounds interesting. What kind of features does it have?" },
      { userId: 1, message: "That's really impressive. I've been working on a web app using React and Node.js. It's been a lot of fun, but also challenging." },
      { userId: 2, message: "Yeah, web development can be pretty complex, especially when you're dealing with frontend and backend technologies. Have you tried using TypeScript for your project?" },
      { userId: 1, message: "Yes, I have. It's definitely helped catch some errors before runtime, but it's also been a bit of a learning curve for me." },
      { userId: 2, message: "Yeah, TypeScript can be a bit daunting at first, but it's definitely worth learning. It can save you a lot of time and headaches in the long run." },
      { userId: 1, message: "I agree. Do you have any tips for learning TypeScript?" },
      { userId: 2, message: "I would recommend starting with some simple projects and gradually building up your skills. Also, don't be afraid to ask for help or consult the official TypeScript documentation." },
      { userId: 1, message: "Thanks for the advice. I'll keep that in mind. Have you worked with any interesting APIs lately?" },
      { userId: 2, message: "Actually, I recently integrated the OpenWeatherMap API into one of my projects. It was really fun to work with and added some cool functionality." },
      { userId: 1, message: "That sounds really cool. What kind of data were you able to get from it?" },
      { userId: 2, message: "I was able to get current weather data for a specific location, as well as forecast data for the next several days." },
      { userId: 1, message: "That's awesome. I'll have to check that out for one of my projects. Have you worked with any machine learning libraries before?" },
      { userId: 2, message: "Yeah, I've played around with TensorFlow a bit. It's a really powerful library for building and training neural networks." },
      { userId: 1, message: "That sounds really interesting. What kind of applications have you built with it?" },
      { userId: 2, message: "I built a simple image classification model for identifying different types of flowers, as well as a sentiment analysis model for classifying movie reviews." },
      { userId: 1, message: "Wow, that's really cool. I've been wanting to learn more about machine learning. Do you have any resources to recommend?" },
      { userId: 2, message: "I would recommend checking out the book 'Hands-On Machine Learning with Scikit-Learn and TensorFlow' by Aurélien Géron. It's a great introduction to machine learning." },
      { userId: 1, message: "Thanks for the recommendation. I'll definitely check that out. Have you heard about any new programming trends or technologies lately?" },
      { userId: 2, message: "Yeah, I've been hearing a lot about WebAssembly lately. It's a technology that allows you to run compiled code in the browser at near-native speeds." },
      { userId: 1, message: "That's really interesting. Do you think it will become a popular technology in the future?" },
      { userId: 1, message: "That's really cool. I'll have to look into it more. Have you ever contributed to any open-source projects?" },
      { userId: 2, message: "Yes, I've contributed to a few projects on GitHub. It's a great way to learn from other developers and give back to the community." },
      { userId: 1, message: "That's really cool. I've been thinking about contributing to an open-source project, but I'm not sure where to start." },
      { userId: 2, message: "I would recommend finding a project that you're interested in and looking for issues labeled as 'good first issues'. These are usually smaller tasks that are good for beginners." },
      { userId: 1, message: "That's a great idea. Thanks for the tip. It was great talking with you about programming." },
      { userId: 2, message: "Likewise. It's always great to talk with another programmer and exchange ideas. Take care!" }
    ],
    last_message: '',
    imageUrl: 'https://media.geeksforgeeks.org/wp-content/cdn-uploads/20221222184908/web-development1.png'
  },
  {
    id: 2,
    title: 'Art chat',
    userIds: [1, 2],
    messages: [
      { userId: 1, message: "Hey, have you seen any good art exhibitions recently?" },
      { userId: 2, message: "Yeah, I went to a really interesting one at the contemporary art museum last week. It was all about political art." },
      { userId: 1, message: "That sounds fascinating. What kind of political art was on display?" },
      { userId: 2, message: "There were a lot of pieces that were critical of the government and social issues like racism and sexism. There was also some artwork that explored the intersection of art and politics." },
      { userId: 1, message: "That's really cool. I'd love to see it. Do you have any favorite artists?" },
      { userId: 2, message: "Yeah, one of my favorites is Banksy. I love his street art and the way he uses humor to make a statement." },
      { userId: 1, message: "I've seen some of Banksy's work online, but never in person. It would be amazing to see it up close." },
      { userId: 2, message: "Definitely. Have you ever tried making any art yourself?" },
      { userId: 1, message: "I used to draw and paint a lot when I was younger, but I haven't done much lately. How about you?" },
      { userId: 2, message: "I've been getting into digital art recently. It's been really fun to experiment with different techniques and styles." },
      { userId: 1, message: "That's really cool. What software do you use for digital art?" },
      { userId: 2, message: "I use Procreate on my iPad. It's a really powerful app with a lot of features." },
      { userId: 1, message: "I've heard of Procreate, but I've never used it. Do you have any tips for getting started?" },
      { userId: 2, message: "I would recommend watching some tutorials on YouTube and experimenting with different brushes and settings. It can take some time to get used to, but it's worth it." },
      { userId: 1, message: "Thanks for the advice. I'll definitely check it out. Do you have any favorite art museums or galleries?" },
      { userId: 2, message: "Yeah, the Tate Modern in London is one of my favorites. They have a great collection of contemporary art." },
      { userId: 1, message: "I've never been to the Tate Modern, but it sounds amazing. Have you ever seen any art that made you emotional or had a big impact on you?" },
      { userId: 2, message: "Definitely. I remember seeing a painting by Frida Kahlo that really moved me. Her artwork is so powerful and personal." },
      { userId: 1, message: "I love Frida Kahlo's work too. She had such a unique style and voice. Have you ever taken any art classes?" },
      { userId: 2, message: "I took a few drawing classes in college, but I mostly learned on my own through practice and experimentation." },
      { userId: 1, message: "That's really impressive. I've been thinking about taking some art classes to improve my skills." },
      { userId: 2, message: "That's a great idea. There are a lot of online resources and courses available these days, soit's easier than ever to learn new techniques and styles." },
      { userId: 1, message: "Yeah, I've been browsing some online courses and tutorials. It's hard to decide which one to start with though!" },
      { userId: 2, message: "I know what you mean. It can be overwhelming at first. I would recommend starting with something that interests you and building from there." },
      { userId: 1, message: "That makes sense. I think I'll start with a beginner drawing course and see where it takes me. Thanks for the advice." },
      { userId: 2, message: "No problem. Let me know how it goes. I'm always happy to talk about art and offer feedback." },
      { userId: 1, message: "Thanks, I appreciate it. Do you have any favorite art books or resources you would recommend?" },
      { userId: 2, message: "Yeah, there's a great book called 'The Artist's Way' by Julia Cameron. It's all about unlocking your creativity and developing your artistic skills." },
      { userId: 1, message: "That sounds interesting. I'll have to check it out. Have you ever attended any art workshops or retreats?" },
      { userId: 2, message: "I've attended a few painting workshops and they were really fun. It's a great way to learn from other artists and get feedback on your work." },
      { userId: 1, message: "That's something I've always wanted to try. Maybe I'll look into attending a workshop or retreat in the future." },
      { userId: 2, message: "Definitely. It's a great way to immerse yourself in the creative process and learn from others." },
      { userId: 1, message: "Have you ever tried collaborating with other artists on a project?" },
      { userId: 2, message: "Yes, I've collaborated with a few friends on some art projects. It's always interesting to see how different artists approach the same subject." },
      { userId: 1, message: "That sounds really cool. I've always wanted to collaborate with other artists, but I haven't had the opportunity yet." },
      { userId: 2, message: "It's definitely worth trying. You might be surprised at how much you can learn and grow as an artist through collaboration." },
      { userId: 1, message: "Thanks for the advice. I'll have to look for opportunities to collaborate in the future." },
      { userId: 2, message: "No problem. It was great talking with you about art. Let me know if you have any questions or want to share your artwork with me." },
      { userId: 1, message: "Thanks, I will. It was great talking with you too." },
      { userId: 2, message: "Take care and keep creating!" },
      { userId: 1, message: "You too. Have a great day." },
      { userId: 2, message: "Thanks, you too." },
      { userId: 1, message: "Bye for now." },
      { userId: 2, message: "Goodbye!" },
      { userId: 1, message: "Hey, I found this really interesting article about the history of art. Have you read it?" },
      { userId: 2, message: "No, I haven't. Can you send me the link? I'd love to check it out." },
      { userId: 1, message: "Sure thing. Here's the link: [insert link]. It's a really fascinating read." },
      { userId: 2, message: "Thanks for sharing. I'll definitely give it a read." },
      { userId: 1, message: "No problem. I always enjoy learning about the history of art and how it has evolved over time." },
      { userId: 2, message: "Me too. It's amazing to see how different art movements and styles have emerged throughout history." }
    ],
    last_message: '',
    imageUrl: 'https://winslowartcenter.com/wp-content/uploads/2020/07/artchatLogosketch_1-e1634206772638.jpg',
  }
]

const ROLES = [
  {
    userId: 1,
    chatId: 1,
    role: 'ADMIN'
  },
  {
    userId: 2,
    chatId: 1,
    role: 'USER'
  },
  {
    userId: 1,
    chatId: 2,
    role: 'USER'
  },
  {
    userId: 2,
    chatId: 2,
    role: 'ADMIN'
  }
]

module.exports = async () => {
  for (const seedChat of CHATS){
    await chat.upsert({
      where: {
        id: seedChat.id
      },
      create: {
        title: seedChat.title,
        imageUrl: seedChat.imageUrl,
        users: {
          connect: seedChat.userIds.map(el => ({
            id: el
          }))
        },
        messages: {
          create: seedChat.messages.map(el => ({
            userId: el.userId,
            message: el.message
          }))
        }
      },
      update: {}
    })
  }
}
