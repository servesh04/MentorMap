import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Course } from '../types';
import { SEED_COURSES } from '../data/seedData';

const COURSES_COLLECTION = 'courses';

export const courseService = {
    // Fetch all courses
    async getAllCourses(): Promise<Course[]> {
        try {
            const querySnapshot = await getDocs(collection(db, COURSES_COLLECTION));
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
        } catch (error) {
            console.error("Error fetching courses:", error);
            throw error;
        }
    },

    // Fetch single course by ID
    async getCourseById(id: string): Promise<Course | null> {
        try {
            // 1. Try to fetch from Database first
            const docRef = doc(db, COURSES_COLLECTION, id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() } as Course;
            }

            // 2. If not found in DB, check if it's a dynamic request that needs generation
            if (id.startsWith('dynamic-')) {
                const searchTerm = id.replace('dynamic-', '').split('-').map(word =>
                    word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' '); // "dynamic-react-native" -> "React Native"

                return {
                    id: id,
                    title: `Learn ${searchTerm}`,
                    description: `AI-generated learning path for ${searchTerm}.`,
                    level: 'Beginner',
                    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
                    modules: [], // Start empty, let AI fill it
                    isGenerated: true
                };
            }

            return null;
        } catch (error) {
            console.error("Error fetching course:", error);
            throw error;
        }
    },

    // Seed database (Admin utility)
    async seedCourses() {
        console.log("Starting seed process...");
        for (const course of SEED_COURSES) {
            try {
                await setDoc(doc(db, COURSES_COLLECTION, course.id), course);
                console.log(`Seeded course: ${course.title}`);
            } catch (error) {
                console.error(`Failed to seed ${course.title}:`, error);
            }
        }
        console.log("Seeding complete.");
    },

    // Save a new course (used for AI generated courses)
    async saveCourse(course: Course) {
        try {
            await setDoc(doc(db, COURSES_COLLECTION, course.id), {
                ...course,
                isGenerated: false // Reset flag so it's treated as a normal course next time
            });
            console.log(`Saved generated course: ${course.title}`);
        } catch (error) {
            console.error("Failed to save course:", error);
            throw error;
        }
    }
};
