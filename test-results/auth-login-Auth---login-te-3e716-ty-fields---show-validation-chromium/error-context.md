# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - generic [ref=e8]:
      - img "Go Quant Logo" [ref=e11]
      - generic [ref=e12]:
        - heading "Welcome" [level=3] [ref=e13]
        - paragraph [ref=e14]: Enter your credentials
        - generic [ref=e15]:
          - generic [ref=e16]:
            - generic [ref=e17]: Email
            - textbox "Email" [ref=e18]
          - generic [ref=e19]:
            - generic [ref=e20]: Password
            - generic [ref=e22]:
              - textbox "Enter your password" [ref=e23]
              - generic [ref=e24]:
                - img [ref=e25]
                - generic [ref=e30]: Toggle password visibility
          - button "Sign In" [ref=e31] [cursor=pointer]
        - generic [ref=e32]:
          - text: By continuing, you agree to our
          - button "Terms of Service" [ref=e33] [cursor=pointer]
          - text: and
          - button "Privacy Policy" [ref=e34] [cursor=pointer]
    - region "Notifications alt+T"
  - alert [ref=e35]
```