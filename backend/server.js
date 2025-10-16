const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer'); // Importa o Nodemailer
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// --- Conexão com o Banco de Dados (MongoDB) ---
const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  console.error('ERRO: A variável MONGO_URI não foi encontrada no arquivo .env');
  process.exit(1);
}

console.log('Tentando conectar ao MongoDB Atlas...');
mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB conectado com sucesso!'))
  .catch(err => console.error(err));

// --- Configuração do Nodemailer (usando Ethereal para testes) ---
// CUIDADO: Em produção, substitua por um serviço real como Gmail, SendGrid, etc.
let transporter;
async function setupEmail() {
    // Cria uma conta de teste no Ethereal
    let testAccount = await nodemailer.createTestAccount();
    console.log('Conta de teste Ethereal criada:', testAccount.user);

    transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: testAccount.user, // Usuário gerado pelo Ethereal
            pass: testAccount.pass, // Senha gerada pelo Ethereal
        },
    });
}
setupEmail().catch(console.error);


// --- Modelos do Banco de Dados ---
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'client' }
});
const User = mongoose.model('User', UserSchema);

// Schema de Agendamento ATUALIZADO para aceitar múltiplos serviços
const AppointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  clientName: { type: String, required: true },
  clientEmail: { type: String, required: true }, // Adicionado email do cliente
  services: [{ // Alterado para um array de strings
    name: String,
    price: String
  }],
  totalPrice: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  status: { type: String, default: 'Confirmado' }
});
const Appointment = mongoose.model('Appointment', AppointmentSchema);


// --- Rotas da API ---

// Rota de Cadastro (sem alterações)
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'Usuário criado com sucesso!' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar usuário', error });
  }
});

// Rota de Login (sem alterações)
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Senha incorreta' });
    const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1h' });
    res.json({ token, role: user.role, name: user.name });
});

// **NOVO**: Rota para buscar horários já agendados em um dia
app.get('/api/appointments/booked', async (req, res) => {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: 'A data é obrigatória.'});
    
    try {
        const startOfDay = new Date(date);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setUTCHours(23, 59, 59, 999);

        const appointments = await Appointment.find({ date: { $gte: startOfDay, $lte: endOfDay } });
        const bookedTimes = appointments.map(apt => apt.time);
        res.json(bookedTimes);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar horários', error });
    }
});


// Rota para criar agendamento ATUALIZADA
app.post('/api/appointments', async (req, res) => {
  const { clientName, clientEmail, services, totalPrice, date, time } = req.body;

  // VERIFICAÇÃO de horário
  const existingAppointment = await Appointment.findOne({ date, time });
  if (existingAppointment) {
      return res.status(409).json({ message: 'Este horário já está agendado. Por favor, escolha outro.' });
  }

  try {
    const appointment = new Appointment({ clientName, clientEmail, services, totalPrice, date, time });
    await appointment.save();

    // Lógica de ENVIO DE E-MAIL
    if (transporter) {
        const servicesHtml = services.map(s => `<li>${s.name} - ${s.price}</li>`).join('');
        const formattedDate = new Date(date).toLocaleDateString('pt-BR', { timeZone: 'UTC', day: '2-digit', month: 'long', year: 'numeric' });

        // E-mail para o cliente
        const mailToClient = {
            from: '"Gabriel Rocha Barbearia" <no-reply@barbearia.com>',
            to: clientEmail,
            subject: 'Confirmação de Agendamento',
            html: `
                <h1>Olá, ${clientName}!</h1>
                <p>Seu agendamento foi confirmado com sucesso.</p>
                <h3>Detalhes:</h3>
                <ul>
                    <li><strong>Data:</strong> ${formattedDate}</li>
                    <li><strong>Horário:</strong> ${time}</li>
                    <li><strong>Serviços:</strong><ul>${servicesHtml}</ul></li>
                    <li><strong>Total:</strong> ${totalPrice}</li>
                </ul>
                <p>Até breve!</p>
            `,
        };

        // E-mail para o barbeiro
        const mailToBarber = {
            from: '"Sistema de Agendamento" <no-reply@barbearia.com>',
            to: 'gabriel@barber.com', // E-mail do barbeiro
            subject: `Novo Agendamento: ${clientName} às ${time}`,
            html: `
                <h1>Novo Agendamento Recebido</h1>
                <h3>Detalhes:</h3>
                <ul>
                    <li><strong>Cliente:</strong> ${clientName} (${clientEmail})</li>
                    <li><strong>Data:</strong> ${formattedDate}</li>
                    <li><strong>Horário:</strong> ${time}</li>
                    <li><strong>Serviços:</strong><ul>${servicesHtml}</ul></li>
                    <li><strong>Total:</strong> ${totalPrice}</li>
                </ul>
            `,
        };
        
        const clientEmailInfo = await transporter.sendMail(mailToClient);
        const barberEmailInfo = await transporter.sendMail(mailToBarber);

        console.log("E-mail para cliente enviado! Preview URL: %s", nodemailer.getTestMessageUrl(clientEmailInfo));
        console.log("E-mail para barbeiro enviado! Preview URL: %s", nodemailer.getTestMessageUrl(barberEmailInfo));
    }
    
    res.status(201).json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao criar agendamento', error });
  }
});


// Rotas de gerenciamento (sem alterações)
app.get('/api/appointments', async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ message: 'A data é obrigatória.' });
  try {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);
    const appointments = await Appointment.find({ date: { $gte: startOfDay, $lte: endOfDay } }).sort({ time: 1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar agendamentos', error });
  }
});

app.patch('/api/appointments/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!appointment) return res.status(404).json({ message: 'Agendamento não encontrado' });
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar status', error });
  }
});

app.delete('/api/appointments/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Agendamento não encontrado' });
    res.status(200).json({ message: 'Agendamento cancelado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao cancelar agendamento', error });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));