
const LoadingModal = ({ isModalOpen }) => {
  if (!isModalOpen) return null;
  return (
    <div class="fixed top-0 left-0 w-screen h-screen flex justify-center items-center bg-neutral-300 z-auto">
        <div class="bg-white p-20 rounded-xl shadow-lg flex flex-col justify-center">
            <h1 class='font-bold text-xl'>Scanning in progress...</h1>
            <svg class="animate-spin h-600 w-600" viewBox="0 0 600 600">
                <circle fill='none'cx='300' cy='300' r="150" stroke-dasharray='800 1400' stroke-linecap='round' stroke="blue" stroke-width="10"></circle>
            </svg>
            
        </div>
    </div>
    
  )
}

export default LoadingModal