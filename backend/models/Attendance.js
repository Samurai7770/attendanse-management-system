const admin = require('firebase-admin');
const db = admin.firestore();

class Attendance {
  constructor(data) {
    this.id = data.id;
    this.lectureId = data.lectureId;
    this.studentId = data.studentId;
    this.studentName = data.studentName;
    this.timestamp = data.timestamp;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  static async findOne(query) {
    try {
      const attendanceRef = db.collection('attendance');
      let queryRef = attendanceRef;

      if (query.lectureId && query.studentId) {
        queryRef = queryRef.where('lectureId', '==', query.lectureId)
                          .where('studentId', '==', query.studentId);
      }

      const snapshot = await queryRef.limit(1).get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return new Attendance({
        id: doc.id,
        ...doc.data()
      });
    } catch (error) {
      console.error('Error finding attendance:', error);
      throw error;
    }
  }

  static async find(query = {}) {
    try {
      const attendanceRef = db.collection('attendance');
      let queryRef = attendanceRef;

      if (query.lectureId) {
        queryRef = queryRef.where('lectureId', '==', query.lectureId);
      }

      const snapshot = await queryRef.get();
      const attendances = [];
      snapshot.forEach(doc => {
        attendances.push(new Attendance({
          id: doc.id,
          ...doc.data()
        }));
      });
      return attendances;
    } catch (error) {
      console.error('Error finding attendances:', error);
      throw error;
    }
  }

  async save() {
    try {
      const attendanceRef = db.collection('attendance');
      const docRef = this.id ? attendanceRef.doc(this.id) : attendanceRef.doc();

      const data = {
        lectureId: this.lectureId,
        studentId: this.studentId,
        studentName: this.studentName,
        timestamp: this.timestamp || new Date(),
        createdAt: this.createdAt || new Date(),
        updatedAt: new Date()
      };

      await docRef.set(data);
      this.id = docRef.id;
      this.createdAt = data.createdAt;
      this.updatedAt = data.updatedAt;
      this.timestamp = data.timestamp;
      return this;
    } catch (error) {
      console.error('Error saving attendance:', error);
      throw error;
    }
  }

  static create(data) {
    return new Attendance(data);
  }
}

module.exports = Attendance;