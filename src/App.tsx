import { BrowserRouter, Route, Routes } from 'react-router-dom'
import SmoothScroll from './components/layout/SmoothScroll'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import About from './pages/About'
import Classes from './pages/Classes'
import Exams from './pages/Exams'
import HelpingHand from './pages/HelpingHand'
import Reviews from './pages/Reviews'
import Blog from './pages/Blog'
import Contact from './pages/Contact'
import StudentLogin from './pages/StudentLogin'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <SmoothScroll>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="classes" element={<Classes />} />
            <Route path="exams" element={<Exams />} />
            <Route path="helping-hand" element={<HelpingHand />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="blog" element={<Blog />} />
            <Route path="contact" element={<Contact />} />
            <Route path="student-login" element={<StudentLogin />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </SmoothScroll>
    </BrowserRouter>
  )
}
