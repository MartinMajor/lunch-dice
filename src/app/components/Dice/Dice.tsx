import React from "react";

function Dice() {
    return (
        <div className="w-72 h-96 overflow-hidden mx-auto">
            <div className="w-72 h-72 bg-dice bg-cover rounded-full shadow-[0_0_20px_20px_#ebe9eb_inset] z-0" />
            <div className="w-72 h-20 bg-plate bg-cover bg-center -mt-4 z-1" />
        </div>
    )
}

export default Dice
