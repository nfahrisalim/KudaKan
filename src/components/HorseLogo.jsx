const HorseLogo = ({ className = "w-8 h-8", fillColor = "fill-kudakan-red" }) => {
  return (
    <svg viewBox="0 0 100 100" className={`${className} ${fillColor}`}>
      {/* Horse head outline */}
      <path d="M30 20 Q35 15 45 18 Q50 12 60 15 Q70 18 75 25 L78 30 Q80 35 75 40 L70 45 Q65 50 60 48 L55 50 Q50 55 45 52 L40 55 Q35 52 32 47 L28 42 Q25 37 27 32 Z"/>
      
      {/* Horse legs */}
      <path d="M45 45 L50 60 L55 75 L60 85 L58 88 L52 86 L48 82 L45 75 L42 60 L40 50 Q42 47 45 45"/>
      <path d="M55 45 L60 60 L65 75 L70 85 L68 88 L62 86 L58 82 L55 75 L52 60 L50 50 Q52 47 55 45"/>
      
      {/* Horse eyes */}
      <circle cx="40" cy="30" r="2" className="fill-current"/>
      <circle cx="60" cy="30" r="2" className="fill-current"/>
      
      {/* Horse mane */}
      <path d="M25 25 Q20 20 22 15 Q25 18 30 20"/>
      <path d="M75 25 Q80 20 78 15 Q75 18 70 20"/>
    </svg>
  )
}

export default HorseLogo
