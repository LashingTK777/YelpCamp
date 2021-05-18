const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connection")
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 400; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '6096d5a5984f304364107c3d',
            location: `${cities[random1000].city},${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            geometry: {
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ],
                type: 'Point'
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dv0z0x122/image/upload/v1620898289/YelpCamp/mrzntbwx7xzdzofngcuj.jpg',
                    filename: 'YelpCamp/mrzntbwx7xzdzofngcuj'
                },
                {
                    url: 'https://res.cloudinary.com/dv0z0x122/image/upload/v1620898289/YelpCamp/k7tobyitj1tlc1fejxcm.jpg',
                    filename: 'YelpCamp/k7tobyitj1tlc1fejxcm'
                },
                {
                    url: 'https://res.cloudinary.com/dv0z0x122/image/upload/v1620898289/YelpCamp/pboh6rkglnck9yetef3s.jpg',
                    filename: 'YelpCamp/pboh6rkglnck9yetef3s'
                }
            ],
            description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. At minus debitis perferendis culpa obcaecati deleniti dolor, id quos quae corrupti modi vero reprehenderit! Dolorum dolores tempore fugiat, accusamus nostrum labore. Temporibus assumenda in ab harum, autem odio, corrupti culpa cumque hic, quod obcaecati? Tempore, vitae? Autem, quos commodi. Omnis atque, animi quod excepturi nesciunt deserunt in consequuntur numquam suscipit provident! Adipisci non omnis quaerat, dolore autem nobis officiis nihil neque obcaecati sit culpa sapiente corporis ratione accusantium facere cupiditate sed enim consequatur nesciunt quas eos officia! Eaque hic quo quas.  Nam repellat expedita dolore aliquid possimus exercitationem eius tempora blanditiis quae, est aliquam amet deleniti maiores nihil. Debitis quae labore, perferendis, dolor eum id, nulla consequatur tempora qui omnis odio. Rerum aperiam odio nobis inventore magni provident numquam sunt animi fugit. Iste quisquam obcaecati quia minus velit nihil adipisci quibusdam cumque. Pariatur in at id porro neque exercitationem ratione vel.',
            price: price
        })
        await camp.save();
    }

}
seedDB().then(() => {
    mongoose.connection.close();
});
