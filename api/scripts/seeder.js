// Import necessary modules using ES Module syntax
import mongoose from 'mongoose';
import Service from '../models/serviceModel.js'; // Adjust path if needed

// Your seeding function
const seedServices = async () => {
  const services = [
    {
      name: 'Ethan Brown',
      imageSrc: '/images/andro-2.png',
      imageAlt: 'Ethan Brown Android Developer',
      description: 'I build feature-rich Android apps, focusing on scalability.',
      price: 650000,
      rating: 4.95,
      category: 'Android Development'
    },
    {
      name: 'Mia Hernandez',
      imageSrc: '/images/image2.png',
      imageAlt: 'Mia Hernandez Android Developer',
      description: 'I craft intuitive Android applications.',
      price: 550000,
      rating: 4.0,
      category: 'Android Development'
    }
  ];

  try {
    await Service.insertMany(services);
    console.log('Services seeded successfully');
  } catch (error) {
    console.error('Error seeding services:', error);
  }
};

// Connect to MongoDB
const connectDb = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/your-db-name', { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB', error);
  }
};

// Run seeder when the file is directly executed
if (import.meta.url === new URL(import.meta.url).href) {
  await connectDb();
  await seedServices();
  mongoose.connection.close();
}
