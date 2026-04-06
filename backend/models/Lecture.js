const admin = require('firebase-admin');
const db = admin.firestore();

class Lecture {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.subject = data.subject;
    this.teacherId = data.teacherId;
    this.qrCode = data.qrCode;
    this.qrSize = data.qrSize;
    this.qrLevel = data.qrLevel;
    this.startTime = data.startTime;
    this.duration = data.duration;
    this.date = data.date;
    this.room = data.room;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  static async find() {
    try {
      const snapshot = await db.collection('lectures').get();
      const lectures = [];
      snapshot.forEach(doc => {
        lectures.push(new Lecture({
          id: doc.id,
          ...doc.data()
        }));
      });
      return lectures;
    } catch (error) {
      console.error('Error finding lectures:', error);
      throw error;
    }
  }

  static async findOne(query) {
    try {
      const lecturesRef = db.collection('lectures');
      let queryRef = lecturesRef;

      if (query.qrCode) {
        queryRef = queryRef.where('qrCode', '==', query.qrCode);
      }

      const snapshot = await queryRef.limit(1).get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return new Lecture({
        id: doc.id,
        ...doc.data()
      });
    } catch (error) {
      console.error('Error finding lecture:', error);
      throw error;
    }
  }

  async save() {
    try {
      const lecturesRef = db.collection('lectures');
      const docRef = this.id ? lecturesRef.doc(this.id) : lecturesRef.doc();

      const data = {
        title: this.title,
        subject: this.subject,
        teacherId: this.teacherId,
        qrCode: this.qrCode,
        qrSize: this.qrSize || 256,
        qrLevel: this.qrLevel || 'H',
        startTime: this.startTime,
        duration: this.duration || 60,
        date: this.date,
        room: this.room,
        createdAt: this.createdAt || new Date(),
        updatedAt: new Date()
      };

      await docRef.set(data);
      this.id = docRef.id;
      this.createdAt = data.createdAt;
      this.updatedAt = data.updatedAt;
      return this;
    } catch (error) {
      console.error('Error saving lecture:', error);
      throw error;
    }
  }

  static create(data) {
    return new Lecture(data);
  }
}

module.exports = Lecture;