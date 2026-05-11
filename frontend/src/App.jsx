// import AppProvidersWrapper from './components/wrappers/AppProvidersWrapper';
// // import configureFakeBackend from './helpers/fake-backend';
// import AppRouter from './routes/router';
// import { Toaster } from 'react-hot-toast'; // ✅ toast renderer
// import '@/assets/scss/app.scss';

// // configureFakeBackend();

// const App = () => {
//   return (
//     <AppProvidersWrapper>
//       <AppRouter />
//       {/* ✅ Toast messages will render here */}
//       <Toaster position="top-right" reverseOrder={false} />
//     </AppProvidersWrapper>
    
//   );
// };

// export default App;

import AppProvidersWrapper from './components/wrappers/AppProvidersWrapper';
import AppRouter from './routes/router';
import { Toaster } from 'react-hot-toast';
import '@/assets/scss/app.scss';

const App = () => {
  return (
    <AppProvidersWrapper>
      <AppRouter />
      <Toaster position="top-right" reverseOrder={false} />
    </AppProvidersWrapper>
  );
};

export default App;