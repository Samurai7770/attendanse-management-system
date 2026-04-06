const admin = require('firebase-admin');
const db = admin.firestore();

class User {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.role = data.role;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  static async findOne(query) {
    try {
      const usersRef = db.collection('users');
      let queryRef = usersRef;

      if (query.email) {
        queryRef = queryRef.where('email', '==', query.email);
      }

      const snapshot = await queryRef.limit(1).get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return new User({
        id: doc.id,
        ...doc.data()
      });
    } catch (error) {
      console.error('Error finding user:', error);
      throw error;
    }
  }

  async save() {
    try {
      const usersRef = db.collection('users');
      const docRef = this.id ? usersRef.doc(this.id) : usersRef.doc();

      const data = {
        name: this.name,
        email: this.email,
        role: this.role,
        createdAt: this.createdAt || new Date(),
        updatedAt: new Date()
      };

      await docRef.set(data);
      this.id = docRef.id;
      this.createdAt = data.createdAt;
      this.updatedAt = data.updatedAt;
      return this;
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  }

  static create(data) {
    return new User(data);
  }
}

module.exports = User;