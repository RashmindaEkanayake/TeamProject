import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class Check {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        System.out.println("password123 match? " + encoder.matches("password123", "$2a$10$pLgqH1gHk5V5O0lHqjUbe.W3t2E3wU7v0L5hJ9y2g2M2sWw9H8z6e"));
        System.out.println("admin123 match? " + encoder.matches("admin123", "$2a$10$pLgqH1gHk5V5O0lHqjUbe.W3t2E3wU7v0L5hJ9y2g2M2sWw9H8z6e"));
        System.out.println("password match? " + encoder.matches("password", "$2a$10$pLgqH1gHk5V5O0lHqjUbe.W3t2E3wU7v0L5hJ9y2g2M2sWw9H8z6e"));
    }
}
