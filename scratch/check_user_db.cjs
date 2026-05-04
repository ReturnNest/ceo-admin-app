const { Client } = require('pg');

const connectionString = 'postgres://postgres.bjxpanpgrffwohtigkic:gyWLqH7y6rVfoTQt@db.bjxpanpgrffwohtigkic.supabase.co:6543/postgres';

async function checkUser() {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        
        console.log('Checking auth.users...');
        const userRes = await client.query("SELECT id, email FROM auth.users WHERE email = 'petertayo123@gmail.com'");
        console.log('User in auth.users:', userRes.rows);

        if (userRes.rows.length > 0) {
            const userId = userRes.rows[0].id;
            console.log('Checking public.profiles...');
            const profileRes = await client.query("SELECT * FROM public.profiles WHERE id = $1", [userId]);
            console.log('Profile in public.profiles:', profileRes.rows);
        } else {
            console.log('User not found in auth.users');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkUser();
