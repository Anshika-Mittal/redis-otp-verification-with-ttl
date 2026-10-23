import express from 'express';
import Redis from 'ioredis';

const app = express();
app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Reliable
function otpKey(phone){
    return `otp:${phone}`;
}

app.post('/otp', async (req, res) => {
    const { phone } = req.body;
    if (!phone) {
        return res.status(400).json({ error: 'Phone number is required' });
    }
    else if (!/^\d{10}$/.test(phone)) {
        return res.status(400).json({ error: 'Invalid phone number format' });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
    await redis.set(otpKey(phone), otp, 'EX', 60); //expires in 60 seconds 
    res.status(200).json({ message: 'OTP sent successfully', otp: otp });
    console.log(`OTP for ${phone}: ${otp}`); 
});

app.post('/otp/verify', async (req, res) => {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
        return res.status(400).json({ error: 'Phone number and OTP are required' });
    }
    const storedOtp = await redis.get(otpKey(phone));
    if (!storedOtp) {
        return res.status(400).json({ error: 'OTP has expired or does not exist' });
    }
    if (storedOtp === otp) {
        // validate user here
        await redis.del(otpKey(phone)); 
        return res.json({ message: 'OTP verified successfully' });
    } else {
        return res.status(400).json({ error: 'Invalid OTP' });
    }
});

app.get('/otp/:phone/ttl', async (req, res) => {
    const phone = req.params.phone;
    const ttl = await redis.ttl(otpKey(phone));
    res.json({ ttl });
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});