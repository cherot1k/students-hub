const {PrismaClient} = require('@prisma/client')
const {post, likeOnPosts, comment} = new PrismaClient()

const POSTS_PARAMS = [
  {
    id: 1,
    tags: [1, 3],
    title: 'Dogs are better pets',
    chunks: [
      {
        image: 'https://a-z-animals.com/media/2022/06/cat-and-dog.jpg',
        text: 'Dogs are better pets than cats because they are more loyal, affectionate, and trainable. They can provide companionship, protection, and even help with physical and emotional needs. With their playful and social nature, they can help owners get more exercise and make new friends. Dogs are also great for families, as they are known to be great with children.',
      }
    ],
    authorId: 2
  },
  {
    id: 2,
    tags: [2, 4],
    title: '31 березня 2023 року відбулося засідання Подільського відділення Академії наук прикладної радіоелектроніки на базі Вінницького інституту землеустрою.',
    chunks: [
      {
        image: 'https://impuls.vntu.edu.ua/media/com_fpss/cache/536_b069b892c6725bd357423bc8f6c17d01_m.jpg',
        text: 'Участь у засіданні, яке проходило в змішаному форматі, прийняло більш як 20 академіків та член-кор. АН ПРЕ, зокрема, з Польщі, Португалії, Іорданії тощо.  Також в роботі засідання взяли участь науковці Вінницького національного медичного університету ім. М. Пирогова. '
      },
    ],
    authorId: 1
  },
  {
    id: 3,
    tags: [2, 4],
    title: 'За значні успіхи у науковій та науково-педагогічній діяльності нагороджено Подякою Василя ПЕТРУКА',
    chunks: [
      {
        image: 'https://impuls.vntu.edu.ua/media/com_fpss/cache/536_b069b892c6725bd357423bc8f6c17d01_m.jpg',
        text: 'Національний університет "Львівська політехніка" нагородив Подякою за значні успіхи у науковій та науково-педагогічній діяльності завідувача кафедри екології, хімії та технологій захисту довкілля, д.т.н., професора, Заслуженого природоохоронця України  Василя ПЕТРУКА.'
      },
    ],
    authorId: 1
  },
  {
    id: 3,
    tags: [2, 4],
    title: 'Студент ФЕЕЕМ здобув два "золота" в І етапі Кубка України з легкоатлетичних метань',
    chunks: [
      {
        image: 'https://impuls.vntu.edu.ua/media/com_fpss/cache/536_b069b892c6725bd357423bc8f6c17d01_m.jpg',
        text: 'З 29 по 31 березня у Києві відбувся І етап Кубка України з легкоатлетичних метань, всеукраїнські змагання з метань "Пам\'яті Заслуженого тренера України Піскунова Ю.О".'
      },
    ],
    authorId: 1
  }
]

const COMMENTS = [
  {
    text: 'Hey sexy',
    userId: 1,
    postId: 1,
    id: 1,
  },
  {
    text: 'Sup',
    userId: 2,
    postId: 2,
    id: 2
  }
]

const POST_LIKES = [
  {
    userId: 1,
    postId: 2,
    id: 1
  },
  {
    postId: 2,
    userId: 1,
    id: 2
  }
]

module.exports = async() => {
  for (const seedPosts of POSTS_PARAMS){
    await post.upsert({
      where: {
        id: seedPosts.id,
      },
      create: {
        title: seedPosts.title,
        tags: {
          create: seedPosts.tags.map(el => ({
            tagId: el
          }))
        },
        chunks: {
          create: seedPosts.chunks.map(el => ({
            ...el
          }))
        },
        user: {
          connect: {
            id: seedPosts.authorId
          }
        },
      },
      update: {}
    })
  }

  for(const seedComment of COMMENTS){
    await comment.upsert({
      where: {
        id: seedComment.id
      },
      create: {
        text: seedComment.text,
        userId: seedComment.userId,
        postId: seedComment.postId
      },
      update: {}
    })
  }

  for(const postLike of POST_LIKES){
    // try{
    //   await likeOnPosts.upsert({
    //     where: {
    //       userId: postLike.userId,
    //       postId: postLike.postId
    //     },
    //     create: {
    //       userId: postLike.userId,
    //       postId: postLike.postId
    //     },
    //     update: {}
    //   })
    // }catch (e) {
    //   console.log('relation exist', e)
    // }
  }
}
