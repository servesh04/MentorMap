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
            const docRef = doc(db, COURSES_COLLECTION, id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() } as Course;
            } else {
                return null;
            }
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
    }
};
