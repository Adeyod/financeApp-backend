import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

const pass = 'Password@1234';
const hashPass = bcrypt.hashSync(pass, 10);

const generateUsers = (num: number) => {
  const users = [];
  const usedUsernames = new Set(); // Track used usernames

  for (let i = 0; i < num; i++) {
    const first_name = faker.person.firstName();
    const last_name = faker.person.lastName();
    let user_name;

    // Ensure unique usernames
    do {
      const mixed = faker.person.firstName();
      const secondMix = faker.person.middleName();
      user_name = mixed + '_' + secondMix;
    } while (usedUsernames.has(user_name));

    usedUsernames.add(user_name); // Add to the set of used usernames

    const email = faker.internet.email({
      firstName: first_name,
      lastName: last_name,
    });
    const password = hashPass;
    const phone_number = faker.phone.number();

    users.push({
      first_name,
      last_name,
      user_name,
      email,
      password,
      phone_number,
    });
  }

  return users;
};

export { generateUsers };
